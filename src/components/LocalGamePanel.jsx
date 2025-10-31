import { useRef, useEffect } from 'react';
import { useLocalGame } from '../contexts/LocalGameContext';
import { FaSyncAlt } from 'react-icons/fa';

const PIECE_SYMBOLS = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' },
};

const getPieceSymbol = (move) => PIECE_SYMBOLS[move.color]?.[move.piece] || '';

export default function LocalGamePanel() {
  const { history, resetGame } = useLocalGame();
  const movesContainerRef = useRef(null);

  // Défilement fluide
  useEffect(() => {
    if (movesContainerRef.current) {
      movesContainerRef.current.scrollTo({
        top: movesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  // Regroupe les coups par paire
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push([history[i], history[i + 1]]);
  }

  // Fonction pour formater un coup
  const formatMove = (move, previousMove) => {
    if (!move) return '';

    // 1. Le coup actuel est-il une prise, un échec ou un mat ?
    const isSignificantAction = move.san.includes('x') || move.san.includes('+') || move.san.includes('#');

    // 2. Le joueur était-il en échec au tour précédent ?
    const wasInCheck = previousMove?.san.includes('+') || false;

    // On combine les conditions : on affiche l'icône si c'est une action significative OU si le joueur sort d'un échec.
    const isSpecialMove = isSignificantAction || wasInCheck;

    // On affiche l'icône seulement si ce n'est pas un pion ET si c'est un coup "spécial"
    const pieceIcon = move.piece !== 'p' && isSpecialMove ? getPieceSymbol(move) + ' ' : '';

    return `${pieceIcon}${move.san}`;
  };

  return (
    <>
      <div className="ai-title">Partie Locale</div>

      <button onClick={resetGame} className="btn-primary" style={{ marginBottom: 24 }}>
        <FaSyncAlt /> Nouvelle partie
      </button>

      <div className="history-panel">
        <div className="section-label">Historique des coups</div>
        <div
          className="history-list"
          ref={movesContainerRef}
          style={{ scrollBehavior: 'smooth' }}
        >
          {history.length === 0 ? (
            <div className="history-empty">L'historique des coups apparaîtra ici.</div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {movePairs.map(([whiteMove, blackMove], index) => (
                  <tr key={index} className="hover:bg-gray-700 rounded">
                    <td className="py-1 text-gray-400 text-right pr-2 w-8 align-top">
                      {index + 1}.
                    </td>
                    <td
                      className="py-1 font-semibold pr-4 rounded"
                      style={
                        // Est-ce la dernière paire ET le nombre total de coups est impair ?
                        index === movePairs.length - 1 && history.length % 2 === 1
                          ? { background: 'rgba(202, 167, 92, 0.15)' }
                          : {}
                      }
                    >
                      {formatMove(whiteMove, index > 0 ? movePairs[index - 1][1] : null)}
                    </td>
                    <td
                      className="py-1 rounded"
                      style={
                        // Est-ce la dernière paire ET le nombre total de coups est pair ?
                        index === movePairs.length - 1 && history.length % 2 === 0
                          ? { background: 'rgba(202, 167, 92, 0.15)' }
                          : {}
                      }
                    >
                      {formatMove(blackMove, whiteMove)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
