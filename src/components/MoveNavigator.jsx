import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

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
      <div className="nav-buttons">
        <button
          type="button"
          className="btn-nav"
          onClick={onStart}
          disabled={!canGoBackward}
          aria-label="Revenir au début"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          type="button"
          className="btn-nav"
          onClick={onPrev}
          disabled={!canGoBackward}
          aria-label="Coup précédent"
        >
          <FaAngleLeft />
        </button>
      </div>
      <div className="navigator-status">
        <span className="ply-count">
          {currentPly}/{maxPly}
        </span>
        <span className={`status-pill ${isLatest ? "live" : "replay"}`}>
          {isLatest ? "En direct" : "Replay"}
        </span>
      </div>
      <div className="nav-buttons">
        <button
          type="button"
          className="btn-nav"
          onClick={onNext}
          disabled={!canGoForward}
          aria-label="Coup suivant"
        >
          <FaAngleRight />
        </button>
        <button
          type="button"
          className="btn-nav"
          onClick={onEnd}
          disabled={!canGoForward}
          aria-label="Aller au dernier coup"
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    </div>
  );
}
