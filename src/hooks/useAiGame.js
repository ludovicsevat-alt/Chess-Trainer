import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import getHumanizedMove from "../engine/HumanizedStockfish";
import { play as playSound } from "../audio/SoundManager";
import { getLevelLabel } from "../constants/levels";

function triggerSound(move) {
  if (!move) return;
  const san = move.san ?? "";

  if (san.includes("#")) {
    playSound("checkmate");
    return;
  }
  if (san.includes("+")) {
    playSound("check");
    return;
  }
  if (move.captured || move.flags?.includes("c") || move.flags?.includes("e")) {
    playSound("capture");
    return;
  }
  if (move.flags?.includes("k") || move.flags?.includes("q")) {
    playSound("castle");
    return;
  }
  playSound("move");
}

export default function useAiGame() {
  const engineRef = useRef(null);
  const gameRef = useRef(new Chess());

  const initialFen = gameRef.current.fen();
  const [position, setPosition] = useState(initialFen);
  const [engineReady, setEngineReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [playerColor, setPlayerColor] = useState("white");
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [colorChoice, setColorChoice] = useState("white");
  const [elo, setElo] = useState(1200);
  const [history, setHistory] = useState([]);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [positions, setPositions] = useState([initialFen]);
  const [currentPly, setCurrentPly] = useState(0);

  const updateHistory = () =>
    setHistory(gameRef.current.history({ verbose: true }));

  const resetGameState = () => {
    gameRef.current = new Chess();
    const fen = gameRef.current.fen();
    setPosition(fen);
    setHistory([]);
    setPositions([fen]);
    setCurrentPly(0);
    setLocked(false);
    setModal({ open: false, title: "", message: "" });
  };

  const declareResult = (title, message) => {
    setModal({ open: true, title, message });
    setLocked(false);
  };

  const checkGameOver = () => {
    const game = gameRef.current;
    if (!game.isGameOver()) return false;

    if (game.isCheckmate()) {
      const playerWon = game.turn() === (playerColor === "white" ? "b" : "w");
      declareResult(
        playerWon ? "Victoire !" : "Echec et mat !",
        playerWon
          ? "Vous avez vaincu Stockfish."
          : "L'IA gagne cette partie."
      );
    } else if (game.isDraw()) {
      declareResult("Match nul", "Partie nulle - pat ou repetition.");
    }
    return true;
  };

  const makeEngineMove = async () => {
    try {
      const suggestion = await getHumanizedMove(
        engineRef.current,
        gameRef.current,
        elo
      );
      const move = gameRef.current.move({
        from: suggestion.from,
        to: suggestion.to,
        promotion: suggestion.promotion || "q",
      });
      triggerSound(move);
    } catch (error) {
      console.warn("Humanized move failed, fallback random", error);
      const moves = gameRef.current.moves();
      if (!moves.length) return;
      const move = gameRef.current.move(
        moves[Math.floor(Math.random() * moves.length)]
      );
      triggerSound(move);
    } finally {
      setPosition(gameRef.current.fen());
      updateHistory();
      setPositions((prev) => [...prev, gameRef.current.fen()]);
      setCurrentPly((prev) => prev + 1);
      checkGameOver();
    }
  };

  useEffect(() => {
    const worker = new Worker("/engine/stockfish-17.1-lite-single-03e3232.js");
    engineRef.current = worker;

    const listener = (event) => {
      const line = event.data;
      if (typeof line !== "string") return;
      if (line.includes("readyok")) {
        setEngineReady(true);
      }
    };

    worker.addEventListener("message", listener);
    worker.postMessage("uci");
    worker.postMessage("isready");

    return () => {
      worker.removeEventListener("message", listener);
      worker.terminate();
      engineRef.current = null;
    };
  }, []);

  const handleDrop = (sourceSquare, targetSquare) => {
    if (!locked) return false;
    if (currentPly !== positions.length - 1) return false;
    const game = gameRef.current;
    const playerTurn = playerColor === "white" ? "w" : "b";
    if (game.turn() !== playerTurn) return false;

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    triggerSound(move);
    setPosition(game.fen());
    updateHistory();
    setPositions((prev) => [...prev, game.fen()]);
    setCurrentPly((prev) => prev + 1);
    if (checkGameOver()) return true;

    setTimeout(makeEngineMove, 400);
    return true;
  };

  const startGame = () => {
    const resolved =
      colorChoice === "random"
        ? Math.random() < 0.5
          ? "white"
          : "black"
        : colorChoice;

    setPlayerColor(resolved);
    setBoardOrientation(resolved === "black" ? "black" : "white");
    resetGameState();
    setLocked(true);

    if (resolved === "black") {
      setTimeout(makeEngineMove, 600);
    }
  };

  const abandonGame = () => {
    if (!locked) return;
    setLocked(false);
    setModal({
      open: true,
      title: "L'IA remporte la partie",
      message: "Vous avez abandonne. Rejouez pour prendre votre revanche.",
    });
  };

  const closeModal = () => {
    setModal({ open: false, title: "", message: "" });
    setLocked(false);
  };

  const rematch = () => {
    setModal({ open: false, title: "", message: "" });
    startGame();
  };

  const resetMode = () => {
    resetGameState();
    setColorChoice("white");
    setElo(1200);
    setBoardOrientation("white");
    setPlayerColor("white");
  };

  const goToPly = (index) => {
    const clamped = Math.max(0, Math.min(index, positions.length - 1));
    setCurrentPly(clamped);
    setPosition(positions[clamped]);
  };

  const stepBackward = () => {
    if (currentPly === 0) return;
    goToPly(currentPly - 1);
  };

  const stepForward = () => {
    if (currentPly >= positions.length - 1) return;
    goToPly(currentPly + 1);
  };

  const goToStart = () => goToPly(0);

  const goToEnd = () => goToPly(positions.length - 1);

  const isOnLatestPly = currentPly === positions.length - 1;

  return {
    position,
    engineReady,
    boardOrientation,
    handleDrop,
    locked,
    colorChoice,
    setColorChoice,
    elo,
    setElo,
    startGame,
    history,
    abandonGame,
    modal,
    closeModal,
    rematch,
    resetMode,
    getLevelLabelText: getLevelLabel,
    positions,
    currentPly,
    isOnLatestPly,
    goToPly,
    goToStart,
    goToEnd,
    stepBackward,
    stepForward,
  };
}
