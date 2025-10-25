import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import MainLayout from "./MainLayout";
import CenterBoard from "./components/CenterBoard";
import StaticBoard from "./components/StaticBoard";
import { initOnUserGesture, play } from "./audio/SoundManager";

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [view, setView] = useState("static");
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const engineRef = useRef(null);
  const [engineReady, setEngineReady] = useState(false);
  const pendingBestMoveRef = useRef(null);

  useEffect(() => {
    initOnUserGesture();
  }, []);

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

    try {
      const worker = new Worker("/engine/stockfish-17.1-lite-single-03e3232.js");
      engineRef.current = worker;
      const onMsg = (e) => handleLine(e.data);
      worker.addEventListener("message", onMsg);
      worker.postMessage("uci");
      worker.postMessage("isready");

      return () => {
        closed = true;
        if (worker) {
          worker.removeEventListener("message", onMsg);
          try {
            worker.terminate();
          } catch {}
        }
        engineRef.current = null;
        setEngineReady(false);
      };
    } catch (_) {}

    return () => {
      closed = true;
      if (engineRef.current && engineRef.current.terminate) {
        try {
          engineRef.current.terminate();
        } catch {}
      }
      engineRef.current = null;
      setEngineReady(false);
    };
  }, []);

  function handleMenuSelect(id) {
    setSelectedMenu(id);
    switch (id) {
      case "overview":
        setView("static");
        break;
      case "ai":
        setView("engine");
        break;
      case "local":
        setView("static");
        break;
      default:
        break;
    }
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (move === null) return false;

    setPosition(game.fen());
    const isCapture = move?.flags?.includes("c") || move?.flags?.includes("e");
    if (game.isCheckmate()) {
      play("checkmate");
    } else if (game.inCheck()) {
      play("check");
    } else if (isCapture) {
      play("capture");
    } else {
      play("move");
    }

    setTimeout(() => makeEngineMove(game.fen()), 400);
    return true;
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    const res = game.move(randomMove);
    setPosition(game.fen());
    if (game.isCheckmate()) {
      play("checkmate");
    } else if (game.inCheck()) {
      play("check");
    } else if (res?.flags?.includes("c") || res?.flags?.includes("e")) {
      play("capture");
    } else {
      play("move");
    }
  }

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
          const res = game.move({ from, to, promotion: promo });
          setPosition(game.fen());
          if (game.isCheckmate()) {
            play("checkmate");
          } else if (game.inCheck()) {
            play("check");
          } else if (res?.flags?.includes("c") || res?.flags?.includes("e")) {
            play("capture");
          } else {
            play("move");
          }
        } catch (_) {
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
      } catch {}
    }
  }

  return (
    <>
      <MainLayout
        selectedMenu={selectedMenu}
        onSelectMenu={handleMenuSelect}
        center={
          view === "engine" ? (
            <CenterBoard
              position={position}
              onDrop={onDrop}
              resetBoard={resetBoard}
              engineReady={engineReady}
            />
          ) : (
            <StaticBoard position={position} />
          )
        }
      />
    </>
  );
}
