const REASON_LABELS = {
  checkmate: "Echec et mat",
  stalemate: "Pat",
  repetition: "Repetition",
  insufficient_material: "Materiel insuffisant",
  draw: "Match nul",
  resign: "Abandon",
  unknown: "Fin de partie",
};

const resolveView = (result, perspective) => {
  if (!result) return null;

  if (result.outcome === "draw") {
    return {
      status: "draw",
      title: "Match nul",
      subtitle: REASON_LABELS[result.reason] ?? "Partie equilibree",
    };
  }

  const perspectiveColor = perspective === "black" ? "black" : "white";
  if (result.winner && result.winner === perspectiveColor) {
    return {
      status: "win",
      title: "Victoire !",
      subtitle: REASON_LABELS[result.reason] ?? "Bien joue.",
    };
  }

  if (result.winner && result.winner !== perspectiveColor) {
    return {
      status: "lose",
      title: "Defaite",
      subtitle: REASON_LABELS[result.reason] ?? "Rejouez pour retenter votre chance.",
    };
  }

  return {
    status: "info",
    title: "Partie terminee",
    subtitle: REASON_LABELS[result.reason] ?? "La partie est terminee.",
  };
};

export default function GameOverlay({
  result,
  perspective,
  primaryAction,
  secondaryAction,
  children,
}) {
  if (!result) return null;
  const view = resolveView(result, perspective);
  return (
    <div className="game-overlay" role="dialog" aria-live="polite">
      <div className={`game-overlay-card ${view?.status ?? "info"}`}>
        {view?.title && <h2 className="game-overlay-title">{view.title}</h2>}
        {view?.subtitle && (
          <p className="game-overlay-subtitle">{view.subtitle}</p>
        )}
        {children}
        <div className="game-overlay-actions">
          {secondaryAction && (
            <button
              type="button"
              className="btn-secondary"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              type="button"
              className="btn-primary"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
