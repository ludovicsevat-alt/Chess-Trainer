import { useEffect, useRef, useState } from "react";
import GameModal from "./GameModal";

const COLOR_CHOICES = [
  { id: "white", label: "Blanc", icon: "⚪" },
  { id: "black", label: "Noir", icon: "⚫" },
  { id: "random", label: "Aléatoire", icon: "🎲" },
];

const LEVELS = [
  { max: 800, label: "Débutant" },
  { max: 1200, label: "Intermédiaire" },
  { max: 1800, label: "Avancé" },
  { max: 2400, label: "Maître" },
  { max: 3300, label: "Grand maître" },
];

const defaultLabel = (elo) =>
  (LEVELS.find((lvl) => elo <= lvl.max) ?? LEVELS.at(-1))?.label ??
  "Personnalisé";

export default function RightMenu({ selectedMenu = "overview", aiGame }) {
  const aiHistoryRef = useRef(null);
  const isAi = selectedMenu === "ai" && Boolean(aiGame);
  const isOnline = selectedMenu === "online";

  useEffect(() => {
    if (!isAi || !aiHistoryRef.current) return;
    aiHistoryRef.current.scrollTop = aiHistoryRef.current.scrollHeight;
  }, [isAi, aiGame?.history]);

  return (
    <div className="aside right-menu">
      {!isAi && !isOnline && selectedMenu === "overview" && (
        <div className="panel" style={{ padding: 16, textAlign: "center" }}>
          <img src="/assets/icons/logo-horse.png" alt="Chess Trainer" style={{ width: 64, marginBottom: 12 }} />
          <div className="panel-title">Bienvenue</div>
          <div className="muted" style={{ color: "var(--color-accent-light)" }}>
            Sélectionnez un mode à gauche pour commencer.
          </div>
        </div>
      )}

      {isAi && aiGame && <AiControls aiGame={aiGame} historyRef={aiHistoryRef} />}

      {isOnline && <OnlineControls />}
    </div>
  );
}

function AiControls({ aiGame, historyRef }) {
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
    getLevelLabelText = defaultLabel,
  } = aiGame;

  return (
    <>
      <div className="ai-title">Partie contre IA</div>

      <div className="config-panel">
        <div className="section-label">Choisissez votre camp</div>
        <div className="color-grid">
          {COLOR_CHOICES.map((choice) => (
            <button
              key={choice.id}
              className={`choice-btn ${colorChoice === choice.id ? "active" : ""}`}
              onClick={() => setColorChoice(choice.id)}
              disabled={locked}
            >
              <span>{choice.icon}</span>
              {choice.label}
            </button>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          Niveau de l'IA
        </div>
        <div className="elo-card">
          <input
            type="range"
            min="400"
            max="3200"
            step="50"
            value={elo}
            onChange={(e) => setElo(Number(e.target.value))}
            disabled={locked}
          />
          <div className="elo-value">
            Niveau actuel : IA {elo} ({getLevelLabelText(elo)})
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={startGame}
          disabled={locked || !engineReady}
        >
          Lancer la partie
        </button>
      </div>

      <div className="history-panel">
        <div className="section-label">Historique des coups</div>
        <div className="history-list" ref={historyRef}>
          {history.length === 0 && (
            <div className="history-empty">Aucun coup pour le moment.</div>
          )}
          {history.map((entry, idx) => (
            <div key={idx} className="history-item">
              {entry}
            </div>
          ))}
        </div>
      </div>

      <button className="btn-danger" onClick={abandonGame} disabled={!locked}>
        Abandonner
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
  const [colorChoice, setColorChoice] = useState("white");
  const [playerOne, setPlayerOne] = useState("Joueur 1");
  const [playerTwo, setPlayerTwo] = useState("Joueur 2");
  const [timeChoice, setTimeChoice] = useState("none");
  const [incrementChoice, setIncrementChoice] = useState("0");
  const [history, setHistory] = useState([]);
  const historyRef = useRef(null);

  useEffect(() => {
    historyRef.current?.scrollTo({
      top: historyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  const startMatch = () => {
    setHistory((prev) => [
      ...prev,
      `Nouvelle partie — ${playerOne} vs ${playerTwo} (${formatControl(
        timeChoice,
        incrementChoice
      )})`,
    ]);
  };

  const abandonMatch = () => {
    setHistory((prev) => [...prev, `⚑ Partie interrompue par ${playerOne}`]);
  };

  return (
    <>
      <div className="ai-title">Partie en ligne</div>

      <div className="config-panel">
        <div className="section-label">Choisissez votre camp</div>
        <div className="color-grid">
          {COLOR_CHOICES.map((choice) => (
            <button
              key={choice.id}
              className={`choice-btn ${colorChoice === choice.id ? "active" : ""}`}
              onClick={() => setColorChoice(choice.id)}
            >
              <span>{choice.icon}</span>
              {choice.label}
            </button>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          Noms des joueurs
        </div>
        <div className="form-field">
          <label>Joueur 1</label>
          <input
            type="text"
            value={playerOne}
            onChange={(e) => setPlayerOne(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Joueur 2</label>
          <input
            type="text"
            value={playerTwo}
            onChange={(e) => setPlayerTwo(e.target.value)}
          />
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          Contrôle du temps
        </div>
        <div className="time-grid">
          <select
            value={timeChoice}
            onChange={(e) => setTimeChoice(e.target.value)}
          >
            <option value="none">Aucun chrono</option>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
          </select>
          <select
            value={incrementChoice}
            onChange={(e) => setIncrementChoice(e.target.value)}
          >
            <option value="0">+0 s</option>
            <option value="5">+5 s</option>
            <option value="10">+10 s</option>
          </select>
        </div>

        <div className="elo-value" style={{ marginTop: 8 }}>
          Temps sélectionné : {formatControl(timeChoice, incrementChoice)}
        </div>

        <button className="btn-primary" onClick={startMatch}>
          Nouvelle partie
        </button>
      </div>

      <div className="history-panel">
        <div className="section-label">Coups joués</div>
        <div className="history-list" ref={historyRef}>
          {history.length === 0 && (
            <div className="history-empty">En attente des premiers coups.</div>
          )}
          {history.map((entry, idx) => (
            <div key={idx} className="history-item">
              {entry}
            </div>
          ))}
        </div>
      </div>

      <button className="btn-danger" onClick={abandonMatch}>
        Abandonner
      </button>
    </>
  );
}

function formatControl(time, inc) {
  if (time === "none") return "Sans chrono";
  return `${time}' + ${inc}s`;
}
