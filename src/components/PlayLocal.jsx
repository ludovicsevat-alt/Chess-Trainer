import { Chessboard } from 'react-chessboard';
import { useLocalGame } from '../contexts/LocalGameContext';

export default function PlayLocal() {
  // On récupère l'état et les fonctions depuis le contexte partagé.
  const { position, onPieceDrop, gameStatus } = useLocalGame();

  // Ce composant ne gère plus la mise en page globale, seulement son contenu central.
  return (
    <div className="content">
      <div className="board-wrap">
        <Chessboard
          position={position}
          onPieceDrop={onPieceDrop}
          arePiecesDraggable={!gameStatus.isGameOver}
          animationDuration={300}
        />
      </div>
      <div className="muted" style={{ marginTop: 8, textAlign: 'center' }}>
        {gameStatus.message}
      </div>
    </div>
  );
}
