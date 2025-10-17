import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useStockfish } from "../hooks/useStockfish";

export default function PlayVsAI({ onBack }) {
  const [level, setLevel] = useState(3);
  const [humanSide, setHumanSide] = useState("white");
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(() => game.fen());
  const [flags, setFlags] = useState({ playingMove: false });

  // 🔊 Sons depuis /public/sounds/chess/
  const moveSound = useRef(new Audio("/sounds/chess/Move.mp3"));
  const captureSound = useRef(new Audio("/sounds/chess/Capture.mp3"));
  const checkSound = useRef(new Audio("/sounds/chess/Check.mp3"));
  const mateSound = useRef(new Audio("/sounds/chess/Checkmate.mp3"));
  const illegalSound = useRef(new Audio("/sounds/chess/Illegal.mp3"));

  const { ready, thinking, go, onceBestMove, newGame } = useStockfish({ level });
  const turnColor = useMemo(() => (game.turn() === "w" ? "white" : "black"), [game]);

  const reset = (side = humanSide) => {
    const g = new Chess();
    setGame(g);
    setFen(g.fen());
    setFlags({ playingMove: false });
    setHumanSide(side);
    newGame?.();
  };

  const playSoundForMove = (move, { isMate, isCheck }) => {
    if (!move) {
      illegalSound.current.currentTime = 0;
      illegalSound.current.play().catch(() => {});
      return;
    }
    if (move.flags && (move.flags.includes("c") || move.captured)) {
      captureSound.current.currentTime = 0;
      captureSound.current.play().catch(() => {});
    } else if (isMate) {
      mateSound.current.currentTime = 0;
      mateSound.current.play().catch(() => {});
    } else if (isCheck) {
      checkSound.current.currentTime = 0;
      checkSound.current.play().catch(() => {});
    } else {
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch(() => {});
    }
  };

  const makeHumanMove = ({ sourceSquare, targetSquare }) => {
    if (turnColor !== humanSide) return false;

    const g = new Chess(game.fen());
    const move = g.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) {
      playSoundForMove(null, {});
      return false;
    }

    setGame(g);
    setFen(g.fen());

    const isMate = g.isGameOver() && g.isCheckmate();
    const isCheck = g.inCheck();
    playSoundForMove(move, { isMate, isCheck });

    if (!g.isGameOver()) triggerEngine(g.fen());
    return true;
  };

  const triggerEngine = async (fenForEngine) => {
    if (!ready || flags.playingMove) return;
    setFlags((f) => ({ ...f, playingMove: true }));

    const waitBest = onceBestMove();
    go(fenForEngine);
    const uciMove = await waitBest;

    const g = new Chess(fenForEngine);
    const move = g.move({
      from: uciMove.slice(0, 2),
      to: uciMove.slice(2, 4),
      promotion: "q",
    });

    if (move) {
      setGame(g);
      setFen(g.fen());
      const isMate = g.isGameOver() && g.isCheckmate();
      const isCheck = g.inCheck();
      playSoundForMove(move, { isMate, isCheck });
    }

    setFlags((f) => ({ ...f, playingMove: false }));
  };

  useEffect(() => {
    if (!ready) return;
    const g = new Chess(fen);
    if (humanSide === "black" && g.turn() === "w") {
      triggerEngine(fen);
    }
  }, [ready, humanSide, fen]);

  return (
    <div className="w-full h-full flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          onClick={() => onBack?.()}
        >
          ← Retour
        </button>
        <button
          className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
          onClick={() => reset(humanSide)}
        >
          ↺ Réinitialiser
        </button>
        <label className="ml-4">
          Difficulté:
          <select
            className="ml-2 bg-neutral-800 px-2 py-1 rounded"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                Niveau {n}
              </option>
            ))}
          </select>
        </label>
        <label className="ml-4">
          Couleur:
          <select
            className="ml-2 bg-neutral-800 px-2 py-1 rounded"
            value={humanSide}
            onChange={(e) => reset(e.target.value)}
          >
            <option value="white">Blanc</option>
            <option value="black">Noir</option>
          </select>
        </label>
        <span className="ml-4 text-sm opacity-70">
          {ready
            ? thinking
              ? "L’IA réfléchit…"
              : "IA prête"
            : "Initialisation IA…"}
        </span>
      </div>

      <div className="w-full max-w-[min(92vh,92vw)] aspect-square">
        <Chessboard
          position={fen}
          arePiecesDraggable={turnColor === humanSide && !game.isGameOver()}
          onPieceDrop={makeHumanMove}
          customBoardStyle={{ width: "100%", height: "100%" }}
          animationDuration={150}
        />
      </div>
    </div>
  );
}
