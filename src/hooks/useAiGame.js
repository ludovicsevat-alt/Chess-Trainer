import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import getHumanizedMove from "../engine/HumanizedStockfish";
import { play as playSound } from "../audio/SoundManager";

const LEVELS = [
  { max: 800, label: "Débutant" },
  { max: 1200, label: "Intermédiaire" },
  { max: 1800, label: "Avancé" },
  { max: 2400, label: "Maître" },
  { max: 3300, label: "Grand maître" },
];

function formatHistory(game) {
  const history = game.history();
  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    const id = Math.floor(i / 2) + 1;
    const white = history[i] ?? "";
    const black = history[i + 1] ?? "";
    rows.push(`${id}. ${white}${black ? " " + black : ""}`);
  }
  return rows;
}

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
  playSound("move");
}

export default function useAiGame() {
  const engineRef = useRef(null);
  const gameRef = useRef(new Chess());

  const [position, setPosition] = useState(gameRef.current.fen());
  const [engineReady, setEngineReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [playerColor, setPlayerColor] = useState("white");
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [colorChoice, setColorChoice] = useState("white");
  const [elo, setElo] = useState(1200);
  const [history, setHistory] = useState([]);
  const [modal, setModal] = useState({ open: false, title: "", message: "" });

  const updateHistory = () => setHistory(formatHistory(gameRef.current));

  const resetGameState = () => {
    gameRef.current = new Chess();
    setPosition(gameRef.current.fen());
    updateHistory();
    setLocked(false);
    setModal({ open: false, title: "", message: "" });
  };

  const declareResult = (title, message) => {
    setModal({ open: true, title, message });
    setLocked(false);
  };

  const checkGameOver = () => {
    const game = gameRef.current;
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const playerWon = game.turn() === (playerColor === "white" ? "b" : "w");
        declareResult(
          playerWon ? "Victoire !" : "Échec et mat !",
          playerWon ? "Vous avez vaincu Stockfish." : "L'IA gagne cette partie."
        );
      } else if (game.isDraw()) {
        declareResult("Match nul", "Partie nulle — pat ou répétition.");
      }
      return true;
    }
    return false;
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
      setPosition(gameRef.current.fen());
      updateHistory();
      checkGameOver();
    } catch (err) {
      console.warn("Humanized move failed, fallback random", err);
      const moves = gameRef.current.moves();
      if (moves.length) {
        const move = gameRef.current.move(
          moves[Math.floor(Math.random() * moves.length)]
        );
        triggerSound(move);
        setPosition(gameRef.current.fen());
        updateHistory();
        checkGameOver();
      }
    }
  };

  useEffect(() => {
    const worker = new Worker("/engine/stockfish-17.1-lite-single-03e3232.js");
    engineRef.current = worker;
    const listener = (e) => {
      const line = e.data;
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
    if (checkGameOver()) return true;

    setTimeout(() => makeEngineMove(), 400);
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
      setTimeout(() => makeEngineMove(), 600);
    }
  };

  const abandonGame = () => {
    if (!locked) return;
    setLocked(false);
    setModal({
      open: true,
      title: "L'IA remporte la partie",
      message: "Vous avez abandonné. Rejouez pour prendre votre revanche.",
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

  const getLevelLabelText = () => {
    const lvl = LEVELS.find((l) => elo <= l.max) ?? LEVELS.at(-1);
    return lvl?.label ?? "Personnalisé";
  };

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
    getLevelLabelText,
  };
}

