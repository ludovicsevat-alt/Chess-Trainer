const PIECE_SYMBOLS = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" },
};

const pieceOrder = { q: 1, r: 2, b: 3, n: 4, p: 5 };

export default function PlayerTray({
  label,
  color = "w",
  captured = [],
  advantage = 0,
  active = false,
}) {
  const opponentColor = color === "w" ? "b" : "w";
  const sorted = [...captured].sort(
    (a, b) => (pieceOrder[a] ?? 99) - (pieceOrder[b] ?? 99)
  );
  const symbols = PIECE_SYMBOLS[opponentColor];
  const score =
    color === "w"
      ? advantage > 0
        ? `+${advantage}`
        : ""
      : advantage < 0
        ? `+${Math.abs(advantage)}`
        : "";

  return (
    <div className={`player-tray ${active ? "is-active" : ""}`}>
      <div className="player-tray__info">
        <span className="player-tray__name">{label}</span>
        {score && <span className="player-tray__score">{score}</span>}
      </div>
      <div className="player-tray__captured">
        {sorted.map((type, index) => (
          <span key={`${type}-${index}`} className="player-tray__piece">
            {symbols?.[type] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

