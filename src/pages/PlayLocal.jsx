import { useRef, useState, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "../lib/react-chessboard/Chessboard.tsx";

export default function PlayLocal({ onBack }) {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [turn, setTurn] = useState("white");
  const [fadeOut, setFadeOut] = useState(false);

  // --- sons ---
  const moveSound = useRef(new Audio("../assets/sounds/chess/Move.mp3"));
  const captureSound = useRef(new Audio("../assets/sounds/chess/Capture.mp3"));
  const checkSound = useRef(new Audio("../assets/sounds/chess/Check.mp3"));
  const mateSound = useRef(new Audio("../assets/sounds/chess/Checkmate.mp3"));
  const scrollSound = useRef(new Audio("../sounds/scroll.mp3"));

  // --- gestion des déplacements ---
  function onPieceDrop({ sourceSquare, targetSquare }) {
    const move = chessRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) return false; // coup illégal

    // --- sons immédiats et différés ---
    if (chessRef.current.isGameOver()) {
      // échec et mat → seul ce son compte
      mateSound.current.currentTime = 0;
      mateSound.current.play().catch(() => {});
    } else if (move.flags.includes("c")) {
      // capture
      captureSound.current.currentTime = 0;
      captureSound.current.play().catch(() => {});

      // capture + échec
      if (chessRef.current.inCheck()) {
        setTimeout(() => {
          checkSound.current.currentTime = 0;
          checkSound.current.play().catch(() => {});
        }, 120);
      }
    } else if (chessRef.current.inCheck()) {
      // échec seul
      checkSound.current.currentTime = 0;
      checkSound.current.play().catch(() => {});
    } else {
      // déplacement normal : jouer avant la mise à jour du FEN
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch(() => {});
    }

    // mise à jour du plateau après le son
    setFen(chessRef.current.fen());
    setTurn(chessRef.current.turn() === "w" ? "white" : "black");

    return true;
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
    scrollSound.current.currentTime = 0;
    scrollSound.current.play().catch(() => {});
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
