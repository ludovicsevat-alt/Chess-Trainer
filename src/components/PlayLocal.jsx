import { useLocalGame } from "../contexts/LocalGameContext";
import { useSettings } from "../contexts/SettingsContext";
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
  } = useLocalGame();
  const { settings, boardThemeConfig } = useSettings();

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

  return (
    <BoardView
      position={position}
      onPieceDrop={onPieceDrop}
      arePiecesDraggable={!gameStatus.isGameOver && isOnLatestPly}
      statusMessage={statusMessage}
      lastMoveSquares={settings.highlightLastMove ? lastMoveSquares : undefined}
      animationDuration={animationDuration}
      boardThemeColors={boardThemeConfig}
    >
      <MoveNavigator
        currentPly={currentPly}
        maxPly={Math.max(positions.length - 1, 0)}
        onStart={goToStart}
        onPrev={stepBackward}
        onNext={stepForward}
        onEnd={goToEnd}
        isLatest={isOnLatestPly}
      />
    </BoardView>
  );
}
