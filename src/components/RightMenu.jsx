import { useState } from "react";
import GameModal from "./GameModal";
import LocalGamePanel from "./LocalGamePanel";
import GameHistoryPanel from "./GameHistoryPanel";
import { getLevelLabel } from "../constants/levels";
import { useSettings } from "../contexts/SettingsContext";

const COLOR_CHOICES = [
  { id: "white", icon: "\u2654" },
  { id: "black", icon: "\u265A" },
  { id: "random", icon: "\u2680" },
];

export default function RightMenu({ selectedMenu = "overview", aiGame }) {
  const { messages } = useSettings();
  const isAi = selectedMenu === "ai" && Boolean(aiGame);
  const isOnline = selectedMenu === "online";

  return (
    <div className="aside right-menu">
      {!isAi && !isOnline && selectedMenu === "overview" && (
        <div className="panel" style={{ padding: 16, textAlign: "center" }}>
          <img
            src="/assets/icons/logo-horse.png"
            alt="Chess Trainer"
            style={{ width: 64, marginBottom: 12 }}
          />
          <div className="panel-title">{messages.welcomeTitle}</div>
          <div
            className="muted"
            style={{ color: "var(--color-accent-light)" }}
          >
            {messages.welcomeHint}
          </div>
        </div>
      )}

      {isAi && aiGame && <AiControls aiGame={aiGame} />}

      {selectedMenu === "local" && <LocalGamePanel />}

      {isOnline && <OnlineControls />}
    </div>
  );
}

function AiControls({ aiGame }) {
  const { messages } = useSettings();
  const { colorChoice, setColorChoice, elo, setElo, locked, startGame, history, abandonGame,
    modal,
    closeModal,
    rematch,
    engineReady,
    getLevelLabelText = getLevelLabel,
  } = aiGame;
  const currentPly = aiGame.currentPly ?? 0;

  return (
    <>
      <div className="ai-title">{messages.aiTitle}</div>

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

function OnlineControls() {
  const { messages } = useSettings();
  const [colorChoice, setColorChoice] = useState("white");
  const [playerOne, setPlayerOne] = useState("");
  const [playerTwo, setPlayerTwo] = useState("");
  const [timeChoice, setTimeChoice] = useState("none");
  const [incrementChoice, setIncrementChoice] = useState("0");
  const [history, setHistory] = useState([]);

  const startMatch = () => {
    const whiteName = playerOne.trim() || messages.playerOne;
    const blackName = playerTwo.trim() || messages.playerTwo;
    setHistory((prev) => [
      ...prev,
      messages.onlineNewGame
        .replace("{playerOne}", whiteName)
        .replace("{playerTwo}", blackName)
        .replace("{control}", formatControl(timeChoice, incrementChoice, messages)),
    ]);
  };

  const abandonMatch = () => {
    const whiteName = playerOne.trim() || messages.playerOne;
    setHistory((prev) => [
      ...prev,
      messages.onlineInterrupted.replace("{player}", whiteName),
    ]);
  };

  return (
    <>
      <div className="ai-title">{messages.onlineTitle}</div>

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
            >
              <span>{choice.icon}</span>
              {messages.colorLabels?.[choice.id] ?? choice.id}
            </button>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          {messages.playerNamesTitle}
        </div>
        <div className="form-field">
          <label>{messages.playerOne}</label>
          <input
            type="text"
            value={playerOne}
            placeholder={messages.playerOne}
            onChange={(event) => setPlayerOne(event.target.value)}
          />
        </div>
        <div className="form-field">
          <label>{messages.playerTwo}</label>
          <input
            type="text"
            value={playerTwo}
            placeholder={messages.playerTwo}
            onChange={(event) => setPlayerTwo(event.target.value)}
          />
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          {messages.timeControlTitle}
        </div>
        <div className="time-grid">
          <select
            value={timeChoice}
            onChange={(event) => setTimeChoice(event.target.value)}
          >
            <option value="none">{messages.timeNoClock}</option>
            <option value="5">5 min</option>
            <option value="10">10 min</option>
            <option value="15">15 min</option>
          </select>
          <select
            value={incrementChoice}
            onChange={(event) => setIncrementChoice(event.target.value)}
          >
            <option value="0">+0 s</option>
            <option value="5">+5 s</option>
            <option value="10">+10 s</option>
          </select>
        </div>

        <div className="elo-value" style={{ marginTop: 8 }}>
          {messages.timeSelectedPrefix} :{" "}
          {formatControl(timeChoice, incrementChoice, messages)}
        </div>

        <button className="btn-primary" onClick={startMatch}>
          {messages.startMatch}
        </button>
      </div>

      <GameHistoryPanel
        history={history}
        title={messages.movesTitle}
        emptyMessage={messages.movesEmpty}
      />

      <button className="btn-danger" onClick={abandonMatch}>
        {messages.resign}
      </button>
    </>
  );
}

function formatControl(time, inc, messages) {
  if (time === "none") return messages.timeNoClock;
  return `${time}' + ${inc}s`;
}










