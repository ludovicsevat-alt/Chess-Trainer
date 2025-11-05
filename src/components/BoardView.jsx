import ChessboardAdapter from "../adapters/ChessboardAdapter";

export default function BoardView({
  position,
  onPieceDrop,
  boardOrientation = "white",
  arePiecesDraggable = true,
  animationDuration = 300,
  statusMessage,
  statusStyle,
  hintMessage,
  hintStyle,
  lastMoveSquares,
  boardThemeColors,
  topContent,
  bottomContent,
  invalidMoveSquare,
  children,
}) {
  const boardColors = boardThemeColors ?? {
    light: "#f0d9b5",
    dark: "#b58863",
  };

  const lastMoveStyles = Array.isArray(lastMoveSquares)
    ? lastMoveSquares.reduce((acc, square) => {
        if (!square) return acc;
        acc[square] = {
          boxShadow: "inset 0 0 0 3px var(--color-highlight-border)",
          background: "var(--color-highlight)",
        };
        return acc;
      }, {})
    : undefined;

  const invalidMoveStyle = invalidMoveSquare
    ? {
        [invalidMoveSquare]: {
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M20 20 L80 80 M20 80 L80 20' stroke='%23dc3545' stroke-width='24' stroke-linecap='round'/%3e%3c/svg%3e")`,
          backgroundSize: '30% 30%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top right',
        },
      }
    : undefined;

  const customSquareStyles = { ...lastMoveStyles, ...invalidMoveStyle };

  const hasFooterContent =
    bottomContent || statusMessage || hintMessage || children;

  return (
    <div className="content">
      {topContent}
      <div className="board-area">
        <div className="board-wrap">
          <div className="board-inner">
            <ChessboardAdapter
              position={position}
              onPieceDrop={onPieceDrop}
              boardOrientation={boardOrientation}
              arePiecesDraggable={arePiecesDraggable}
              animationDuration={animationDuration}
              customSquareStyles={customSquareStyles}
              customLightSquareStyle={{ backgroundColor: boardColors.light }}
              customDarkSquareStyle={{ backgroundColor: boardColors.dark }}
              customBoardStyle={{
                width: "100%",
                height: "100%",
                borderRadius: "calc(var(--board-radius) - 4px)",
                overflow: "hidden",
              }}
            />
          </div>
        </div>
      </div>
      {hasFooterContent && (
        <div className="player-accessories">
          {bottomContent}
          {statusMessage && (
            <div
              className="muted board-status"
              style={{ textAlign: "center", ...statusStyle }}
            >
              {statusMessage}
            </div>
          )}
          {hintMessage && (
            <div className="muted" style={{ textAlign: "center", ...hintStyle }}>
              {hintMessage}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
