import { useLocalGame } from "../contexts/LocalGameContext";
import { useSettings } from "../contexts/SettingsContext";
import PlayerInfoPanel from "./PlayerInfoPanel";
import BoardView from "./BoardView";
import MoveNavigator from "./MoveNavigator";

export default function PlayLocal() {
  const {
    position,
    onPieceDrop,
    gameStatus,
    history,
    positions,
    currentPly,
    isOnLatestPly,
    stepBackward,
    stepForward,
    goToStart,
    goToEnd,
    capturedPieces,
    materialAdvantage,
  } = useLocalGame();
  const { settings, boardThemeConfig, messages } = useSettings();

  const effectiveMoveIndex = Math.min(
    Math.max(currentPly - 1, 0),
    history.length - 1
  );
  const lastMove =
    history && effectiveMoveIndex >= 0
      ? history[effectiveMoveIndex]
      : undefined;
  const lastMoveSquares = lastMove ? [lastMove.from, lastMove.to] : undefined;
  const animationDuration = settings.animationEnabled
    ? settings.animationDuration
    : 0;
  const liveStatus = gameStatus.message;
  const replayStatus = `Mode replay - coup ${currentPly}/${Math.max(
    positions.length - 1,
    0
  )}`;
  const statusMessage = isOnLatestPly ? liveStatus : replayStatus;
  const orientation = "white";
  const isLive = isOnLatestPly;
  const activeColor = isLive ? gameStatus.turn : null;
  const colorLabels = messages.colorLabels ?? {};
  const whitePlayer = {
    label: colorLabels.white ?? "Blancs",
    captured: capturedPieces?.w ?? [],
    advantage: materialAdvantage ?? 0,
    active: activeColor === "w",
  };
  const blackPlayer = {
    label: colorLabels.black ?? "Noirs",
    captured: capturedPieces?.b ?? [],
    advantage: materialAdvantage ?? 0,
    active: activeColor === "b",
  };
  return (
    <BoardView
      position={position}
      onPieceDrop={onPieceDrop}
      topContent={
        <PlayerInfoPanel
          position="top"
          orientation={orientation}
          white={whitePlayer}
          black={blackPlayer}
        />
      }
      bottomContent={
        <PlayerInfoPanel
          position="bottom"
          orientation={orientation}
          white={whitePlayer}
          black={blackPlayer}
        />
      }
      arePiecesDraggable={!gameStatus.isGameOver && isOnLatestPly}
      lastMoveSquares={
        settings.highlightLastMove ? lastMoveSquares : undefined
      }
      animationDuration={animationDuration}
      boardThemeColors={boardThemeConfig}
    />
  );
}
