import { Chessboard } from "react-chessboard";

export default function CenterBoard({ position, onDrop, resetBoard, engineReady }) {
  return (
    <div className="content">
      <div className="toolbar">
        <button className="btn secondary" onClick={() => history.back()}>↩ Retour</button>
        <button className="btn" onClick={resetBoard}>⟳ Réinitialiser</button>
      </div>
      <div className="board-wrap">
        <Chessboard position={position} onPieceDrop={onDrop} />
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        {engineReady ? "Stockfish prêt" : "Moteur non prêt - utilisation aléatoire"}
      </div>
    </div>
  );
}
