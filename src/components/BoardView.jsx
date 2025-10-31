import { Chessboard } from "react-chessboard";

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

  return (
    <div className="content">
      <div className="board-wrap">
        <Chessboard
          position={position}
          onPieceDrop={onPieceDrop}
          boardOrientation={boardOrientation}
          arePiecesDraggable={arePiecesDraggable}
          animationDuration={animationDuration}
          customSquareStyles={lastMoveStyles}
          customLightSquareStyle={{ backgroundColor: boardColors.light }}
          customDarkSquareStyle={{ backgroundColor: boardColors.dark }}
          customBoardStyle={{
            borderRadius: "calc(var(--board-radius) - 4px)",
            overflow: "hidden",
          }}
        />
      </div>
      {statusMessage && (
        <div
          className="muted board-status"
          style={{ marginTop: 8, textAlign: "center", ...statusStyle }}
        >
          {statusMessage}
        </div>
      )}
      {hintMessage && (
        <div
          className="muted"
          style={{ marginTop: 4, textAlign: "center", ...hintStyle }}
        >
          {hintMessage}
        </div>
      )}
      {children}
    </div>
  );
}
