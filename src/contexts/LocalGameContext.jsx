import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Chess } from "chess.js";
import { play as playSound } from "../audio/SoundManager";

const LocalGameContext = createContext(undefined);

export function LocalGameProvider({ children }) {
  const game = useRef(new Chess());

  const initialFen = game.current.fen();
  const [position, setPosition] = useState(initialFen);
  const [gameStatus, setGameStatus] = useState({
    turn: "w",
    message: "Tour des blancs",
    isGameOver: false,
  });
  const [history, setHistory] = useState([]);
  const [positions, setPositions] = useState([initialFen]);
  const [currentPly, setCurrentPly] = useState(0);

  const updateStatus = useCallback(() => {
    const turn = game.current.turn();
    let message = turn === "w" ? "Tour des blancs" : "Tour des noirs";
    let isGameOver = false;

    if (game.current.isCheckmate()) {
      message = `${turn === "w" ? "Les noirs" : "Les blancs"} gagnent par echec et mat.`;
      isGameOver = true;
      playSound("checkmate");
    } else if (game.current.isDraw()) {
      message = "Partie nulle.";
      isGameOver = true;
    } else if (game.current.isCheck()) {
      message += " (echec)";
      if (!isGameOver) playSound("check");
    }

    setGameStatus({ turn, message, isGameOver });
  }, []);

  const onPieceDrop = useCallback(
    (sourceSquare, targetSquare) => {
      if (gameStatus.isGameOver) return false;
      if (currentPly !== positions.length - 1) return false;

      const currentGame = game.current;
      try {
        const move = currentGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (move === null) return false;

        if (move.flags.includes("c")) {
          playSound("capture");
        } else {
          playSound("move");
        }

        setPosition(currentGame.fen());
        setHistory(currentGame.history({ verbose: true }));
        setPositions((prev) => [...prev, currentGame.fen()]);
        setCurrentPly((prev) => prev + 1);
        updateStatus();

        return true;
      } catch {
        return false;
      }
    },
    [currentPly, positions.length, gameStatus.isGameOver, updateStatus]
  );

  const resetGame = useCallback(() => {
    game.current.reset();
    const fen = game.current.fen();
    setPosition(fen);
    setHistory([]);
    setPositions([fen]);
    setCurrentPly(0);
    setGameStatus({
      turn: "w",
      message: "Tour des blancs",
      isGameOver: false,
    });
  }, []);

  const goToPly = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(index, positions.length - 1));
      setCurrentPly(clamped);
      setPosition(positions[clamped]);
    },
    [positions]
  );

  const stepBackward = useCallback(() => {
    if (currentPly === 0) return;
    goToPly(currentPly - 1);
  }, [currentPly, goToPly]);

  const stepForward = useCallback(() => {
    if (currentPly >= positions.length - 1) return;
    goToPly(currentPly + 1);
  }, [currentPly, positions.length, goToPly]);

  const goToStart = useCallback(() => goToPly(0), [goToPly]);

  const goToEnd = useCallback(
    () => goToPly(positions.length - 1),
    [goToPly, positions.length]
  );

  const isOnLatestPly = currentPly === positions.length - 1;

  const value = {
    position,
    gameStatus,
    history,
    positions,
    currentPly,
    isOnLatestPly,
    goToPly,
    goToStart,
    goToEnd,
    stepBackward,
    stepForward,
    onPieceDrop,
    resetGame,
  };

  return (
    <LocalGameContext.Provider value={value}>
      {children}
    </LocalGameContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useLocalGame() {
  const context = useContext(LocalGameContext);
  if (context === undefined) {
    throw new Error("useLocalGame must be used within a LocalGameProvider");
  }
  return context;
}
