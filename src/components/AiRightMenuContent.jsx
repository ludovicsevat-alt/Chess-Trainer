import GameModal from "./GameModal";
import GameHistoryPanel from "./GameHistoryPanel";
import { useSettings } from "../contexts/SettingsContext";
import { getLevelLabel } from "../constants/levels";
import { COLOR_CHOICES } from "../constants/colorChoices";
import MoveNavigator from "./MoveNavigator";

export default function AiRightMenuContent({ aiGame }) {
  const { messages } = useSettings();

  if (!aiGame) {
    return (
      <div className="panel" style={{ padding: 16, textAlign: "center" }}>
        <div className="panel-title">{messages.aiTitle}</div>
        <div className="muted">{messages.aiStatusLoading}</div>
      </div>
    );
  }

  const {
    colorChoice,
    setColorChoice,
    elo,
    setElo,
    locked,
    startGame,
    history,
    abandonGame,
    modal,
    closeModal,
    rematch,
    engineReady,
    getLevelLabelText = getLevelLabel,
    positions,
    goToStart,
    stepBackward,
    stepForward,
    goToEnd,
    isOnLatestPly,
  } = aiGame;
  const currentPly = aiGame.currentPly ?? 0;

  return (
    <>
      <div className="ai-title">{messages.aiTitle}</div>
      {aiGame.gameStatus && (
        <div className="muted board-status" style={{ textAlign: "center", marginBottom: 16 }}>
          {aiGame.gameStatus.message}
        </div>
      )}

      <div className="config-panel">
        <div className="section-label">{messages.chooseSideLabel}</div>
        <div className="color-grid">
          {COLOR_CHOICES.map((choice) => (
            <button
              key={choice.id}
              className={`choice-btn ${
                colorChoice === choice.id ? "active" : ""
              }`}
              onClick={() => setColorChoice(choice.id)}
              disabled={locked}
            >
              <span>{choice.icon}</span>
              {messages.colorLabels?.[choice.id] ?? choice.id}
            </button>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          {messages.aiLevelTitle}
        </div>
        <div className="elo-card">
          <input
            type="range"
            min="400"
            max="3200"
            step="50"
            value={elo}
            onChange={(event) => setElo(Number(event.target.value))}
            disabled={locked}
          />
          <div className="elo-value">
            {messages.aiLevelTitle}: {elo} ({getLevelLabelText(elo)})
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={startGame}
          disabled={locked || !engineReady}
        >
          {messages.aiLaunchButton}
        </button>
      </div>

      <GameHistoryPanel history={history} activePly={currentPly} />

      {locked && (
        <MoveNavigator
          currentPly={currentPly}
          maxPly={Math.max(positions.length - 1, 0)}
          onStart={goToStart}
          onPrev={stepBackward}
          onNext={stepForward}
          onEnd={goToEnd}
          isLatest={isOnLatestPly}
        />
      )}

      <button className="btn-danger" onClick={abandonGame} disabled={!locked}>
        {messages.resign}
      </button>

      <GameModal
        open={modal.open}
        title={modal.title}
        description={modal.message}
        onClose={closeModal}
        onRematch={rematch}
      />
    </>
  );
}

