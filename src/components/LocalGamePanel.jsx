import { useLocalGame } from "../contexts/LocalGameContext";
import GameHistoryPanel from "./GameHistoryPanel";
import { FaSyncAlt } from "react-icons/fa";
import { useSettings } from "../contexts/SettingsContext";
import MoveNavigator from "./MoveNavigator";

export default function LocalGamePanel({ gameStatus }) {
  const {
    history,
    resetGame,
    currentPly,
    positions,
    goToStart,
    stepBackward,
    stepForward,
    goToEnd,
    isOnLatestPly,
  } = useLocalGame();
  const { messages } = useSettings();

  return (
    <>
      <div className="ai-title">{messages.localTitle}</div>
      {gameStatus && (
        <div className="muted board-status" style={{ textAlign: "center", marginBottom: 16 }}>
          {gameStatus.message}
        </div>
      )}

      <button
        onClick={resetGame}
        className="btn-primary"
        style={{ marginBottom: 24 }}
      >
        <FaSyncAlt /> {messages.startMatch}
      </button>

      <GameHistoryPanel history={history} activePly={currentPly} />

      <MoveNavigator
        currentPly={currentPly}
        maxPly={Math.max(positions.length - 1, 0)}
        onStart={goToStart}
        onPrev={stepBackward}
        onNext={stepForward}
        onEnd={goToEnd}
        isLatest={isOnLatestPly}
      />
    </>
  );
}
