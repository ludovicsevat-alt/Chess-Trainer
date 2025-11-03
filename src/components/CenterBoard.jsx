import ChessboardAdapter from "../adapters/ChessboardAdapter";

export default function CenterBoard({
  position,
  onDrop,
  resetBoard,
  engineReady,
}) {
  return (
    <div className="content">
      <div className="toolbar">
        <button className="btn secondary" onClick={() => window.history.back()}>
          Retour
        </button>
        <button className="btn" onClick={resetBoard}>
          Reinitialiser
        </button>
      </div>
      <div className="board-wrap">
        <ChessboardAdapter position={position} onPieceDrop={onDrop} />
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        {engineReady
          ? "Stockfish pret"
          : "Moteur non pret - utilisation aleatoire"}
      </div>
    </div>
  );
}
