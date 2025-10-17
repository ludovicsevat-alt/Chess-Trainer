import { useState, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function PlayLocal({ onBack }) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [turn, setTurn] = useState("white");

  const basePath =
    import.meta.env.MODE === "production" ? "/Chess-Trainer" : "";

  const moveSound = useRef(new Audio(`${basePath}/assets/sounds/chess/Move.mp3`));
  const captureSound = useRef(new Audio(`${basePath}/assets/sounds/chess/Capture.mp3`));
  const checkSound = useRef(new Audio(`${basePath}/assets/sounds/chess/Check.mp3`));
  const mateSound = useRef(new Audio(`${basePath}/assets/sounds/chess/Checkmate.mp3`));
  const illegalSound = useRef(new Audio(`${basePath}/assets/sounds/chess/Illegal.mp3`));

  const makeMove = (sourceSquare, targetSquare) => {
    const g = new Chess(game.fen());
    const move = g.move({ from: sourceSquare, to: targetSquare, promotion: "q" });

    if (!move) {
      illegalSound.current.currentTime = 0;
      illegalSound.current.play();
      return false;
    }

    setGame(g);
    setFen(g.fen());
    setTurn(g.turn() === "w" ? "white" : "black");

    const isMate = g.isCheckmate();
    const isCheck = g.inCheck();

    if (move.captured) captureSound.current.play();
    else if (isMate) mateSound.current.play();
    else if (isCheck) checkSound.current.play();
    else moveSound.current.play();

    return true;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={onBack}
          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded"
        >
          ← Retour
        </button>
        <button
          onClick={() => {
            const g = new Chess();
            setGame(g);
            setFen(g.fen());
          }}
          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded"
        >
          ↺ Réinitialiser
        </button>
      </div>

      <div className="w-full max-w-[min(92vh,92vw)] aspect-square">
        <Chessboard
          position={fen}
          onPieceDrop={makeMove}
          arePiecesDraggable={!game.isGameOver()}
          customBoardStyle={{ width: "100%", height: "100%" }}
          animationDuration={150}
        />
      </div>
    </div>
  );
}
