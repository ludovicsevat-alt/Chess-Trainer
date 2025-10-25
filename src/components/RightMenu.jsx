import { useEffect, useRef } from "react";
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

function getLevelLabel(elo) {
  return (LEVELS.find((lvl) => elo <= lvl.max) ?? LEVELS.at(-1))?.label ?? "Personnalisé";
}

export default function RightMenu({ selectedMenu = "overview", aiGame }) {
  if (selectedMenu !== "ai" || !aiGame) {
    return (
      <div className="aside right-menu">
        {selectedMenu === "overview" && (
          <div className="panel" style={{ padding: 16, textAlign: "center", marginBottom: 16 }}>
            <img src="/assets/icons/logo-horse.png" alt="Chess Trainer" style={{ width: 64, marginBottom: 12 }} />
            <div className="panel-title">Bienvenue</div>
            <div className="muted" style={{ color: "var(--color-accent-light)" }}>
              Sélectionnez un mode à gauche pour commencer.
            </div>
          </div>
        )}
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
    getLevelLabelText = () => getLevelLabel(elo),
  } = aiGame;

  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="aside right-menu">
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

        <div className="section-label" style={{ marginTop: 16 }}>Niveau de l'IA</div>
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
            Niveau actuel : IA {elo} ({getLevelLabelText()})
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
          {history.length === 0 && <div className="history-empty">Aucun coup pour le moment.</div>}
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
    </div>
  );
}
