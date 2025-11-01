import { useState } from "react";
import GameHistoryPanel from "./GameHistoryPanel";
import { useSettings } from "../contexts/SettingsContext";
import { COLOR_CHOICES } from "../constants/colorChoices";

export default function OnlineRightMenuContent({ gameStatus }) {
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
        .replace(
          "{control}",
          formatControl(timeChoice, incrementChoice, messages)
        ),
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
      {gameStatus && (
        <div className="muted board-status" style={{ textAlign: "center", marginBottom: 16 }}>
          {gameStatus.message}
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
          {messages.timeSelectedPrefix}:{" "}
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

