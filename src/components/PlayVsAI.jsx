import BoardView from "./BoardView";
import { useSettings } from "../contexts/SettingsContext";
import MoveNavigator from "./MoveNavigator";

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
    engineReady,
    locked,
    history,
    positions,
    currentPly,
    isOnLatestPly,
    stepBackward,
    stepForward,
    goToStart,
    goToEnd,
  } = aiGame;
  const lastMove =
    history && currentPly > 0 && history[currentPly - 1]
      ? history[currentPly - 1]
      : undefined;
  const lastMoveSquares = lastMove ? [lastMove.from, lastMove.to] : undefined;
  const animationDuration = settings.animationEnabled
    ? settings.animationDuration
    : 0;
  const statusMessage = isOnLatestPly
    ? engineReady
      ? messages.aiStatusReady
      : messages.aiStatusLoading
    : `Mode replay - coup ${currentPly}/${Math.max(positions.length - 1, 0)}`;
  const hintMessage =
    locked && !isOnLatestPly
      ? undefined
      : locked
        ? undefined
        : messages.aiHint;

  return (
    <BoardView
      position={position}
      onPieceDrop={handleDrop}
      boardOrientation={boardOrientation}
      arePiecesDraggable={locked && isOnLatestPly}
      statusMessage={statusMessage}
      hintMessage={hintMessage}
      lastMoveSquares={
        settings.highlightLastMove ? lastMoveSquares : undefined
      }
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
