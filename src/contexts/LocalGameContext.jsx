import { createContext, useState, useRef, useContext, useCallback } from 'react';
import { Chess } from 'chess.js';
import { play as playSound } from '../audio/SoundManager';

// 1. Création du contexte
const LocalGameContext = createContext();

// 2. Création du Provider (le composant qui fournira l'état)
export function LocalGameProvider({ children }) {
  // --- LOGIQUE DE JEU ---
  const game = useRef(new Chess());

  // --- ÉTATS ---
  const [position, setPosition] = useState(game.current.fen());
  const [gameStatus, setGameStatus] = useState({
    turn: 'w',
    message: 'Tour des blancs',
    isGameOver: false,
  });
  const [history, setHistory] = useState([]);

  // --- FONCTIONS DE JEU ---
  const updateStatus = useCallback(() => {
    const turn = game.current.turn();
    let message = turn === 'w' ? 'Tour des blancs' : 'Tour des noirs';
    let isGameOver = false;

    if (game.current.isCheckmate()) {
      message = `Échec et mat ! ${turn === 'w' ? 'Les noirs' : 'Les blancs'} ont gagné.`;
      isGameOver = true;
      playSound('checkmate');
    } else if (game.current.isDraw()) {
      message = 'Partie nulle.';
      isGameOver = true;
    } else if (game.current.isCheck()) {
      message += ' (Échec)';
      if (!isGameOver) playSound('check');
    }

    setGameStatus({ turn, message, isGameOver });
  }, []);

  const onPieceDrop = useCallback(
    (sourceSquare, targetSquare) => {
      if (gameStatus.isGameOver) return false;

      const currentGame = game.current;
      try {
        const move = currentGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });

        if (move === null) return false;

        // Joue le son approprié via le SoundManager
        if (move.flags.includes('c')) {
          playSound('capture');
        } else {
          playSound('move');
        }

        setPosition(currentGame.fen());
        setHistory(currentGame.history({ verbose: true }));
        updateStatus();

        return true;
      } catch (error) {
        return false;
      }
    },
    [gameStatus.isGameOver, updateStatus]
  );

  const resetGame = useCallback(() => {
    game.current.reset();
    setPosition(game.current.fen());
    setHistory([]);
    setGameStatus({
      turn: 'w',
      message: 'Tour des blancs',
      isGameOver: false,
    });
  }, []);

  // 3. Valeurs à partager avec les composants enfants
  const value = {
    position,
    gameStatus,
    history,
    onPieceDrop,
    resetGame,
  };

  return (
    <LocalGameContext.Provider value={value}>
      {children}
    </LocalGameContext.Provider>
  );
}

// 4. Hook personnalisé pour consommer le contexte facilement
export function useLocalGame() {
  const context = useContext(LocalGameContext);
  if (context === undefined) {
    throw new Error('useLocalGame must be used within a LocalGameProvider');
  }
  return context;
}
