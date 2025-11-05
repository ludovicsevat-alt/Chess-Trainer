import { useEffect, useMemo, useState } from "react";
import { useTrainingSession } from "../contexts/TrainingSessionContext";
import { getLevelLabel } from "../constants/levels";

export default function TrainingRightMenuContent() {
  const {
    mode,
    setMode,
    guidedSession,
    semiSession,
    loading,
    error,
    onExit,
    elo,
    setElo,
    trainingActive,
    canStartTraining,
    startTraining,
    resetTraining,
    openingData,
    setSubOpeningFile,
  } = useTrainingSession();

  const session =
    mode === "guided"
      ? guidedSession
      : mode === "semi"
        ? semiSession
        : null;
  const coachMessage = session?.coachMessage ?? null;
  const [persistedCoachMessage, setPersistedCoachMessage] = useState(coachMessage);
  useEffect(() => {
    if (coachMessage) {
      setPersistedCoachMessage(coachMessage);
    }
  }, [coachMessage]);
  const displayedCoachMessage = useMemo(
    () => coachMessage ?? persistedCoachMessage,
    [coachMessage, persistedCoachMessage]
  );
  const feedback = session?.feedback ?? null;
  const currentLevelLabel = getLevelLabel(elo);
  const sliderDisabled = mode === "scenario" || trainingActive;

  return (
    <div className="aside right-menu">
      <div className="panel">
        <div className="panel-title">Mode entrainement</div>
        <div className="training-mode-switcher" style={{ display: "grid", gap: 8 }}>
          <button
            className={mode === "guided" ? "btn-primary" : "btn-secondary"}
            type="button"
            onClick={() => setMode("guided")}
          >
            Apprendre
          </button>
          <button
            className={mode === "semi" ? "btn-primary" : "btn-secondary"}
            type="button"
            onClick={() => setMode("semi")}
          >
            Appliquer
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setMode("exercises")}
            disabled
            title="Bientot disponible"
          >
            Exercices
          </button>
        </div>
      </div>

      {mode !== "semi" && openingData && openingData.subOpenings && (
        <div className="panel">
          <div className="panel-title">Variante</div>
          <select
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            onChange={(e) => setSubOpeningFile(e.target.value)}
          >
            {openingData.subOpenings.map((subOpening) => (
              <option key={subOpening.id} value={subOpening.file}>
                {subOpening.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">Adversaire IA</div>
        <div className="muted" style={{ marginBottom: 12 }}>
          Choisissez le niveau de l adversaire cote IA.
        </div>
        <input
          type="range"
          min="400"
          max="3200"
          step="50"
          value={elo}
          onChange={(event) => setElo(Number(event.target.value))}
          disabled={sliderDisabled}
        />
        <div className="muted" style={{ marginTop: 8 }}>
          ELO cible: {elo} ({currentLevelLabel})
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (mode === "semi") {
                const randomSubOpening = openingData.subOpenings[Math.floor(Math.random() * openingData.subOpenings.length)];
                startTraining(randomSubOpening.file);
              } else {
                startTraining();
              }
            }}
            disabled={!canStartTraining || trainingActive || loading}
          >
            Commencer
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={resetTraining}
            disabled={!trainingActive}
          >
            Recommencer
          </button>
        </div>
        {!trainingActive && (
          <div className="muted" style={{ marginTop: 12 }}>
            Ajustez l ELO puis cliquez sur Commencer pour demarrer la sequence.
          </div>
        )}
      </div>

      {loading && (
        <div className="panel">
          <div className="history-empty">Chargement des donnees...</div>
        </div>
      )}

      {error && (
        <div className="panel panel-danger">
          <div className="panel-title">Erreur</div>
          <div className="muted">{error.message}</div>
        </div>
      )}

      {!loading && !error && (
        <div className="panel">
          <div className="panel-title">{displayedCoachMessage?.title ?? "Coach"}</div>
          <div className="muted" style={{ marginBottom: 12 }}>
            {displayedCoachMessage?.detail ?? "En attente de la prochaine instruction."}
          </div>
        </div>
      )}

      {!loading && !error && feedback && (
        <div
          className={
            feedback.type === "success"
              ? "panel panel-success"
              : feedback.type === "warning"
                ? "panel panel-warning"
                : feedback.type === "error"
                  ? "panel panel-danger"
                  : "panel"
          }
        >
          <div className="panel-title">{feedback.title}</div>
          <div className="muted" style={{ marginBottom: feedback.hint ? 8 : 0 }}>
            {feedback.detail}
          </div>
          {feedback.canReveal && feedback.expectedSan && (
            <div className="muted" style={{ marginBottom: 8 }}>
              Coup recommande a viser : <strong>{feedback.expectedSan}</strong>
            </div>
          )}
          {feedback.hint && (
            <div className="muted" style={{ fontStyle: "italic", marginBottom: 8 }}>
              Indice : {feedback.hint}
            </div>
          )}
          {(feedback.canRetry || feedback.canReveal) && (
            <div className="coach-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {feedback.canRetry && session?.retryLastMove && (
                <button className="btn-secondary" type="button" onClick={() => session.retryLastMove()}>
                  Rejouer ce coup
                </button>
              )}
              {feedback.canReveal && session?.revealBestMove && (
                <button className="btn-primary" type="button" onClick={() => session.revealBestMove()}>
                  Montrer le coup
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="panel">
        <button className="btn-tertiary" onClick={onExit}>
          Quitter l'entrainement
        </button>
      </div>
    </div>
  );
}
