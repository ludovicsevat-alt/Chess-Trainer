import { useEffect, useRef } from "react";
import { useSettings } from "../contexts/SettingsContext";

const PIECE_SYMBOLS = {
  w: {
    p: "\u2659",
    r: "\u2656",
    n: "\u2658",
    b: "\u2657",
    q: "\u2655",
    k: "\u2654",
  },
  b: {
    p: "\u265F",
    r: "\u265C",
    n: "\u265E",
    b: "\u265D",
    q: "\u265B",
    k: "\u265A",
  },
};

const getPieceSymbol = (move) => PIECE_SYMBOLS[move.color]?.[move.piece] || "";

export default function GameHistoryPanel({
  history = [],
  title,
  emptyMessage,
  className,
  activePly,
}) {
  const { messages } = useSettings();
  const movesContainerRef = useRef(null);
  const resolvedTitle = title ?? messages.movesTitle;
  const resolvedEmpty = emptyMessage ?? messages.movesEmpty;

  useEffect(() => {
    if (!movesContainerRef.current) return;
    movesContainerRef.current.scrollTo({
      top: movesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push([history[i], history[i + 1]]);
  }

  const formatMove = (move, previousMove) => {
    if (!move) return "";

    if (typeof move === "string") {
      return move;
    }

    const san = move.san;
    const isSignificantAction =
      san.includes("x") || san.includes("+") || san.includes("#");
    const wasInCheck =
      (typeof previousMove === "object" &&
        Boolean(previousMove?.san.includes("+"))) ||
      false;

    const isSpecialMove = isSignificantAction || wasInCheck;
    const pieceIcon =
      move.piece !== "p" && isSpecialMove ? `${getPieceSymbol(move)} ` : "";
    return `${pieceIcon}${san}`;
  };

  const containerClass = ["history-panel", className]
    .filter(Boolean)
    .join(" ");
  const activeMoveIndex =
    typeof activePly === "number" && activePly > 0 ? activePly - 1 : -1;
  const activeRow =
    activeMoveIndex >= 0 ? Math.floor(activeMoveIndex / 2) : null;
  const activeIsBlack = activeMoveIndex >= 0 ? activeMoveIndex % 2 === 1 : null;

  return (
    <div className={containerClass}>
      <div className="section-label">{resolvedTitle}</div>
      <div className="history-list" ref={movesContainerRef}>
        {history.length === 0 ? (
          <div className="history-empty">{resolvedEmpty}</div>
        ) : typeof history[0] === "string" ? (
          history.map((entry, idx) => (
            <div
              key={idx}
              className={`history-item${
                idx === activeMoveIndex ? " history-active" : ""
              }`}
            >
              {entry}
            </div>
          ))
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {movePairs.map(([whiteMove, blackMove], index) => (
                <tr key={index} className="hover:bg-gray-700 rounded">
                  <td className="py-1 text-gray-400 text-right pr-2 w-8 align-top">
                    {index + 1}.
                  </td>
                  <td
                    className={`py-1 font-semibold pr-4 rounded${
                      activeRow === index && activeIsBlack === false
                        ? " history-active"
                        : ""
                    }`}
                  >
                    {formatMove(
                      whiteMove,
                      index > 0 ? movePairs[index - 1][1] : null
                    )}
                  </td>
                  <td
                    className={`py-1 rounded${
                      activeRow === index && activeIsBlack
                        ? " history-active"
                        : ""
                    }`}
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
  );
}
