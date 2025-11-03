import { useMemo } from "react";
import { Chessboard } from "react-chessboard";

/**
 * Adapte l'ancienne API de react-chessboard (<=4.x) vers la v5.
 */
export default function ChessboardAdapter({
  position,
  onPieceDrop,
  boardOrientation = "white",
  arePiecesDraggable = true,
  animationDuration = 300,
  customSquareStyles,
  customLightSquareStyle,
  customDarkSquareStyle,
  customBoardStyle,
  boardThemeColors,
  boardWidth,
  allowDragOffBoard = false,
  showNotation = true,
  options: extraOptions,
}) {
  const options = useMemo(() => {
    const resolvedLight =
      customLightSquareStyle ??
      (boardThemeColors?.light
        ? { backgroundColor: boardThemeColors.light }
        : undefined);
    const resolvedDark =
      customDarkSquareStyle ??
      (boardThemeColors?.dark
        ? { backgroundColor: boardThemeColors.dark }
        : undefined);

    const boardStyle = {
      width: boardWidth ?? "100%",
      height: "100%",
      borderRadius: "calc(var(--board-radius) - 4px)",
      overflow: "hidden",
      ...customBoardStyle,
    };

    return {
      position,
      boardOrientation,
      allowDragging: arePiecesDraggable,
      allowDragOffBoard,
      animationDurationInMs: animationDuration,
      showNotation,
      squareStyles: customSquareStyles,
      lightSquareStyle: resolvedLight,
      darkSquareStyle: resolvedDark,
      boardStyle,
      onPieceDrop:
        typeof onPieceDrop === "function"
          ? ({ sourceSquare, targetSquare, piece }) =>
              onPieceDrop(sourceSquare, targetSquare, piece)
          : undefined,
    };
  }, [
    position,
    boardOrientation,
    arePiecesDraggable,
    allowDragOffBoard,
    animationDuration,
    customSquareStyles,
    customLightSquareStyle,
    customDarkSquareStyle,
    customBoardStyle,
    boardThemeColors,
    boardWidth,
    onPieceDrop,
    showNotation,
  ]);

  return <Chessboard options={{ ...options, ...(extraOptions ?? {}) }} />;
}
