import { Chessboard } from "react-chessboard";

export default function PlayVsAI({ aiGame }) {
  if (!aiGame) {
    return (
      <div className="content">
        <h1>Chargement du moteur...</h1>
      </div>
    );
  }

  const { position, boardOrientation, handleDrop, engineReady, locked } = aiGame;

  return (
    <div className="content">
      <div className="board-wrap">
        <Chessboard
          position={position}
          onPieceDrop={handleDrop}
          boardOrientation={boardOrientation}
          arePiecesDraggable={locked}
          animationDuration={300}
        />
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        {engineReady ? "Stockfish prêt" : "Moteur non prêt – utilisation aléatoire"}
      </div>
      {!locked && (
        <div className="muted" style={{ marginTop: 4 }}>
          Configurez la partie à droite puis lancez-la.
        </div>
      )}
    </div>
  );
}
