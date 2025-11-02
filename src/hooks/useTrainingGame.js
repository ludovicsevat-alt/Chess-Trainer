import { useEffect, useRef, useState, useCallback } from "react";
import { Chess } from "chess.js";
import { play as playSound } from "../audio/SoundManager";

function triggerSound(move) {
  if (!move) return;
  if (move.captured) {
    playSound("capture");
  } else {
    playSound("move");
  }
}

export default function useTrainingGame() {
  const engineRef = useRef(null);
  const gameRef = useRef(new Chess());

  const [position, setPosition] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState({ score: 0, bestMove: null });

  const updateStatus = () => {
    // Logique de statut de jeu simplifiée pour l'entraînement
  };

  const runAnalysis = useCallback(() => {
    if (!engineRef.current) return;
    const fen = gameRef.current.fen();
    engineRef.current.postMessage(`position fen ${fen}`);
    engineRef.current.postMessage("go depth 20"); // Profondeur élevée pour une analyse précise
  }, []);

  useEffect(() => {
    const worker = new Worker("/engine/stockfish-17.1-lite-single-03e3232.js");
    engineRef.current = worker;

    const listener = (event) => {
      const line = event.data;
      if (typeof line !== "string") return;

      if (line.startsWith("info depth")) {
        const scoreMatch = line.match(/score cp (-?\d+)/);
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1], 10) / 100;
          setAnalysis((prev) => ({ ...prev, score }));
        }
      }

      if (line.startsWith("bestmove")) {
        const bestMove = line.split(" ")[1];
        setAnalysis((prev) => ({ ...prev, bestMove }));
      }
    };

    worker.addEventListener("message", listener);
    worker.postMessage("uci");
    worker.postMessage("isready");
    // Paramètres pour une analyse pure
    worker.postMessage("setoption name Skill Level value 20"); // Max skill
    worker.postMessage("setoption name UCI_LimitStrength value false");

    runAnalysis(); // Lancer l'analyse sur la position initiale

    return () => {
      worker.removeEventListener("message", listener);
      worker.terminate();
      engineRef.current = null;
    };
  }, [runAnalysis]);

  const handleDrop = (sourceSquare, targetSquare) => {
    const game = gameRef.current;
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    triggerSound(move);
    setPosition(game.fen());
    setHistory(game.history({ verbose: true }));
    updateStatus();
    runAnalysis(); // Lancer l'analyse après chaque coup
    return true;
  };

  const resetGame = () => {
    gameRef.current = new Chess();
    setPosition(gameRef.current.fen());
    setHistory([]);
    setAnalysis({ score: 0, bestMove: null });
    runAnalysis();
  };

  return {
    position,
    history,
    analysis,
    handleDrop,
    resetGame,
    gameStatus: { isGameOver: false }, // Simplifié
    isOnLatestPly: true, // Toujours sur le dernier coup en entraînement
  };
}
