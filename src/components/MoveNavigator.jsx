export default function MoveNavigator({
  currentPly,
  maxPly,
  onStart,
  onPrev,
  onNext,
  onEnd,
  isLatest,
}) {
  const canGoBackward = currentPly > 0;
  const canGoForward = currentPly < maxPly;

  return (
    <div className="move-navigator">
      <div className="nav-buttons flex-shrink-0">
        <button
          type="button"
          className="btn-nav"
          onClick={onStart}
          disabled={!canGoBackward}
          aria-label="Revenir au début"
        >
          <span className="nav-symbol">⏮</span>
        </button>
        <button
          type="button"
          className="btn-nav"
          onClick={onPrev}
          disabled={!canGoBackward}
          aria-label="Coup précédent"
        >
          <span className="nav-symbol">◀</span>
        </button>
      </div>
      <div className="navigator-status flex-grow">
        <span className="ply-count">
          {currentPly}/{maxPly}
        </span>
        <span
          className={`status-pill whitespace-nowrap flex-shrink-0 ${
            isLatest ? "live" : "replay"
          }`}
          style={{ minWidth: "80px", textAlign: "center" }}
        >
          {isLatest ? "En direct" : "Replay"}
        </span>
      </div>
      <div className="nav-buttons flex-shrink-0">
        <button
          type="button"
          className="btn-nav"
          onClick={onNext}
          disabled={!canGoForward}
          aria-label="Coup suivant"
        >
          <span className="nav-symbol">▶</span>
        </button>
        <button
          type="button"
          className="btn-nav"
          onClick={onEnd}
          disabled={!canGoForward}
          aria-label="Aller au dernier coup"
        >
          <span className="nav-symbol">⏭</span>
        </button>
      </div>
    </div>
  );
}
