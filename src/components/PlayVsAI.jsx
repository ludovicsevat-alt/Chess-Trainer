import { useSettings } from "../contexts/SettingsContext";
import BoardView from "./BoardView";
import PlayerInfoPanel from "./PlayerInfoPanel";

export default function PlayVsAI({ aiGame }) {
  const { settings, messages, boardThemeConfig } = useSettings();

  if (!aiGame) {
    return (
      <div className="content">
        <h1>Chargement du moteur...</h1>
      </div>
    );
  }

  const {
    position,
    boardOrientation,
    handleDrop,
    locked,
    history,
    currentPly,
    isOnLatestPly,
    capturedPieces,
    materialAdvantage,
    playerColor,
  } = aiGame;
  const lastMove =
    history && currentPly > 0 && history[currentPly - 1]
      ? history[currentPly - 1]
      : undefined;
  const lastMoveSquares = lastMove ? [lastMove.from, lastMove.to] : undefined;
  const animationDuration = settings.animationEnabled
    ? settings.animationDuration
    : 0;
  const isLive = locked && isOnLatestPly;
  const activeColor = isLive ? (currentPly % 2 === 0 ? "w" : "b") : null;
  const youLabel = messages.playerYou ?? "You";
  const aiLabel = messages.playerAi ?? "Stockfish";
  const humanColor =
    playerColor === "black"
      ? "b"
      : playerColor === "white"
        ? "w"
        : boardOrientation === "black"
          ? "b"
          : "w";
  const whitePlayer = {
    label: humanColor === "w" ? youLabel : aiLabel,
    captured: capturedPieces?.w ?? [],
    advantage: materialAdvantage ?? 0,
    active: activeColor === "w",
  };
  const blackPlayer = {
    label: humanColor === "b" ? youLabel : aiLabel,
    captured: capturedPieces?.b ?? [],
    advantage: materialAdvantage ?? 0,
    active: activeColor === "b",
  };

  return (
    <BoardView
      position={position}
      onPieceDrop={handleDrop}
      boardOrientation={boardOrientation}
      topContent={
        <PlayerInfoPanel
          position="top"
          orientation={boardOrientation}
          white={whitePlayer}
          black={blackPlayer}
        />
      }
      bottomContent={
        <PlayerInfoPanel
          position="bottom"
          orientation={boardOrientation}
          white={whitePlayer}
          black={blackPlayer}
        />
      }
      arePiecesDraggable={locked && isOnLatestPly}
      lastMoveSquares={
        settings.highlightLastMove ? lastMoveSquares : undefined
      }
      animationDuration={animationDuration}
      boardThemeColors={boardThemeConfig}
    />
  );
}
