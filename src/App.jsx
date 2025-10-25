import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const engineRef = useRef(null);
  const [engineReady, setEngineReady] = useState(false);
  const pendingBestMoveRef = useRef(null);

  // Initialise le moteur Stockfish (Worker lite-single dans public/engine)
  useEffect(() => {
    let closed = false;

    const handleLine = (line) => {
      if (typeof line !== "string") return;
      if (line.includes("uciok")) return;
      if (line.includes("readyok")) {
        setEngineReady(true);
        return;
      }
      if (line.startsWith("bestmove")) {
        const parts = line.split(/\s+/);
        pendingBestMoveRef.current = parts[1] || null;
      }
    };
    let worker = null;
    try {
      worker = new Worker("/engine/stockfish-17.1-lite-single-03e3232.js");
      engineRef.current = worker;
      const onMsg = (e) => handleLine(e.data);
      worker.addEventListener("message", onMsg);
      worker.postMessage("uci");
      worker.postMessage("isready");

      return () => {
        closed = true;
        if (worker) {
          worker.removeEventListener("message", onMsg);
          try { worker.terminate(); } catch {}
        }
        engineRef.current = null;
        setEngineReady(false);
      };
    } catch (err) {
      console.error("Impossible de démarrer le Worker Stockfish (lite-single)", err);
    }

    return () => {
      closed = true;
      if (engineRef.current && engineRef.current.terminate) {
        try { engineRef.current.terminate(); } catch {}
      }
      engineRef.current = null;
      setEngineReady(false);
    };
  }, []);

  function onDrop(sourceSquare, targetSquare) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    setPosition(game.fen());
    console.log("Coup joué:", move);

    // Small delay before engine reply
    setTimeout(() => makeEngineMove(game.fen()), 400);
    return true;
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;

    const randomMove =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    game.move(randomMove);
    setPosition(game.fen());
    console.log("IA (aléatoire) joue:", randomMove);
  }

  // Ask Stockfish for a best move from a FEN, apply it when received.
  function makeEngineMove(fen) {
    if (!engineRef.current || !engineReady) {
      makeRandomMove();
      return;
    }

    pendingBestMoveRef.current = null;

    try {
      engineRef.current.postMessage(`position fen ${fen}`);
      engineRef.current.postMessage("go movetime 600");
    } catch (_) {
      // Engine not responding as UCI, fallback
      makeRandomMove();
      return;
    }

    const start = Date.now();
    const poll = () => {
      if (pendingBestMoveRef.current) {
        const best = pendingBestMoveRef.current;
        pendingBestMoveRef.current = null;
        try {
          const from = best.slice(0, 2);
          const to = best.slice(2, 4);
          const promo = best.slice(4) || undefined;
          game.move({ from, to, promotion: promo });
          setPosition(game.fen());
          console.log("Stockfish joue:", best);
        } catch (err) {
          makeRandomMove();
        }
        return;
      }
      if (Date.now() - start > 2000) {
        makeRandomMove();
        return;
      }
      setTimeout(poll, 50);
    };
    poll();
  }

  function resetBoard() {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());

    if (engineRef.current) {
      try {
        engineRef.current.postMessage("stop");
      } catch (_) {}
    }
  }

  return (
    <div style={{ width: "480px", margin: "auto", paddingTop: "40px" }}>
      <button
        onClick={resetBoard}
        style={{
          display: "block",
          margin: "0 auto 10px",
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        Nouvelle partie
      </button>
      <Chessboard position={position} onPieceDrop={onDrop} />
      <div style={{ textAlign: "center", marginTop: 8, color: engineReady ? "#2e7d32" : "#9e9e9e" }}>
        {engineReady ? "Stockfish prêt" : "Moteur non prêt – utilisation aléatoire"}
      </div>
    </div>
  );
}
