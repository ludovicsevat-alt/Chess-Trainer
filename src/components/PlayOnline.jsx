import BoardView from "./BoardView";
import PlayerInfoPanel from "./PlayerInfoPanel";
import GameOverlay from "./GameOverlay.jsx";
import { useSettings } from "../contexts/SettingsContext";

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
    history = [],
    currentPly,
    isOnLatestPly,
    handleDrop,
    boardOrientation,
    onlineState = {},
    capturedPieces = { w: [], b: [] },
    materialAdvantage = 0,
    gameStatus,
    gameResult,
    leaveRoom,
  } = onlineGame;

  const players = onlineState.players ?? [];
  const selfPlayer = players.find((player) => player.id === onlineState.playerId);

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

  const primaryOverlayAction = onlineState.roomId
    ? {
        label: "Quitter la salle",
        onClick: leaveRoom,
      }
    : null;

  return (
    <>
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
      />

      <GameOverlay
        result={gameResult}
        perspective={selfPlayer?.color ?? colorKey(boardOrientation)}
        primaryAction={primaryOverlayAction}
      />
    </>
  );
}
