import BoardView from "./BoardView";
import PlayerInfoPanel from "./PlayerInfoPanel";
import MoveNavigator from "./MoveNavigator";
import GameHistoryPanel from "./GameHistoryPanel";
import GameOverlay from "./GameOverlay.jsx";
import { useSettings } from "../contexts/SettingsContext";

const buildHintMessage = (state, hasOpponent) => {
  if (!state?.connected) return "Connexion au serveur en cours...";
  if (state.status === "waiting") {
    return "Partagez l'identifiant de salle pour inviter un adversaire.";
  }
  if (!state.roomId) {
    return "Creez ou rejoignez une salle via le panneau de droite.";
  }
  if (!hasOpponent || state.status !== "ready") {
    return "En attente d'un adversaire. Partagez votre identifiant.";
  }
  return null;
};

const colorKey = (color) => (color === "white" ? "white" : "black");

export default function PlayOnline({ onlineGame }) {
  const { messages, boardThemeConfig } = useSettings();

  if (!onlineGame) {
    return (
      <div className="content online-content">
        <h1>Initialisation du mode en ligne...</h1>
      </div>
    );
  }

  const {
    position,
    positions = [],
    history = [],
    currentPly,
    isOnLatestPly,
    handleDrop,
    boardOrientation,
    onlineState = {},
    capturedPieces = { w: [], b: [] },
    materialAdvantage = 0,
    goToStart,
    stepBackward,
    stepForward,
    goToEnd,
    goToPly,
    gameStatus,
    gameResult,
    leaveRoom,
  } = onlineGame;

  const players = onlineState.players ?? [];
  const selfPlayer = players.find((player) => player.id === onlineState.playerId);
  const opponentPlayer = players.find((player) => player.id !== onlineState.playerId);
  const hasOpponent = Boolean(opponentPlayer);

  const orientation = boardOrientation ?? (selfPlayer?.color === "black" ? "black" : "white");
  const activeMove = currentPly > 0 ? history[currentPly - 1] : null;
  const lastMoveSquares =
    activeMove && typeof activeMove === "object"
      ? [activeMove.from, activeMove.to]
      : undefined;

  const activeTurn = isOnLatestPly ? gameStatus?.turn : null;

  const whitePlayer = {
    label: players.find((player) => player.color === "white")?.name ?? messages.playerOne,
    captured: capturedPieces.w ?? [],
    advantage: materialAdvantage,
    active: activeTurn === "w",
  };
  const blackPlayer = {
    label: players.find((player) => player.color === "black")?.name ?? messages.playerTwo,
    captured: capturedPieces.b ?? [],
    advantage: materialAdvantage,
    active: activeTurn === "b",
  };

  const hintMessage = buildHintMessage(onlineState, hasOpponent);
  const statusMessage = gameStatus?.message;
  const maxPly = Math.max(positions.length - 1, 0);

  const primaryOverlayAction = onlineState.roomId
    ? {
        label: "Quitter la salle",
        onClick: leaveRoom,
      }
    : null;

  return (
    <div className="content online-content">
      <BoardView
        position={position}
        onPieceDrop={handleDrop}
        boardOrientation={orientation}
        arePiecesDraggable={
          isOnLatestPly && !gameStatus?.isGameOver && onlineState.status === "ready"
        }
        lastMoveSquares={lastMoveSquares}
        animationDuration={300}
        boardThemeColors={boardThemeConfig}
        statusMessage={statusMessage}
        hintMessage={hintMessage ?? messages.onlineTitle}
        topContent={
          <PlayerInfoPanel
            position="top"
            orientation={orientation}
            white={whitePlayer}
            black={blackPlayer}
          />
        }
        bottomContent={
          <PlayerInfoPanel
            position="bottom"
            orientation={orientation}
            white={whitePlayer}
            black={blackPlayer}
          />
        }
      >
        <MoveNavigator
          currentPly={currentPly}
          maxPly={maxPly}
          onStart={goToStart}
          onPrev={stepBackward}
          onNext={stepForward}
          onEnd={goToEnd}
          isLatest={Boolean(isOnLatestPly)}
        />
        <GameHistoryPanel
          history={history}
          activePly={currentPly}
          onSelectMove={goToPly}
        />
      </BoardView>

      <GameOverlay
        result={gameResult}
        perspective={selfPlayer?.color ?? colorKey(boardOrientation)}
        primaryAction={primaryOverlayAction}
      />
    </div>
  );
}
