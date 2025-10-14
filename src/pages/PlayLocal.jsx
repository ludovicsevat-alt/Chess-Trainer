import { useRef, useState, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "../lib/react-chessboard/Chessboard.tsx";

export default function PlayLocal({ onBack }) {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [turn, setTurn] = useState("white");
  const [fadeOut, setFadeOut] = useState(false);
  const scrollSound = useRef(null);
  const moveSound = useRef(null);

  // --- gestion des déplacements ---
  function onPieceDrop({ sourceSquare, targetSquare }) {
    const move = chessRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) return false; // coup illégal → la pièce revient

    setFen(chessRef.current.fen());
    setTurn(chessRef.current.turn() === "w" ? "white" : "black");

    if (moveSound.current) {
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch(() => {});
    }

    return true; // coup validé
  }

  // --- options du plateau ---
  const chessboardOptions = useMemo(
    () => ({
      id: "local-board",
      position: fen,
      onPieceDrop,
      arePiecesDraggable: true,
      boardOrientation: "white",
      animationDuration: 200,
      customLightSquareStyle: { backgroundColor: "#e0d7b6" },
      customDarkSquareStyle: { backgroundColor: "#3a4a55" },
      showBoardNotation: true,
    }),
    [fen]
  );

  // --- retour menu ---
  const handleBack = () => {
    if (scrollSound.current) {
      scrollSound.current.currentTime = 0;
      scrollSound.current.play().catch(() => {});
    }
    setFadeOut(true);
    setTimeout(() => onBack(), 700);
  };

  // --- nouvelle partie ---
  const resetGame = () => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setTurn("white");
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-screen bg-[#0d1117] text-gray-100 font-[Cinzel] relative transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* sons */}
      <audio ref={scrollSound} src="/sounds/scroll.mp3" preload="auto"></audio>
      <audio ref={moveSound} src="/sounds/move.mp3" preload="auto"></audio>

      {/* bouton retour */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition"
      >
        ← Retour
      </button>

      <h1 className="text-2xl mb-4 text-yellow-400">
        {turn === "white" ? "⚪ Tour des Blancs" : "⚫ Tour des Noirs"}
      </h1>

      {/* plateau */}
      <div className="h-[90vh] aspect-square rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <Chessboard options={chessboardOptions} />
      </div>

      <div className="mt-5 flex gap-4">
        <button
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition"
          onClick={resetGame}
        >
          🔄 Nouvelle partie
        </button>
      </div>
    </div>
  );
}
