import PlayerTray from "./PlayerTray";

function normalizeColor(color) {
  return color === "black" ? "black" : "white";
}

export default function PlayerInfoPanel({
  position = "top",
  orientation = "white",
  white,
  black,
}) {
  const boardSide = normalizeColor(orientation);
  const isTop = position === "top";
  const topColor = boardSide === "white" ? "b" : "w";
  const bottomColor = boardSide === "white" ? "w" : "b";
  const color = isTop ? topColor : bottomColor;
  const data = color === "w" ? white : black;

  if (!data) {
    return null;
  }

  return (
    <div className={`player-info-bar player-info-bar--${position}`}>
      <PlayerTray
        label={data.label}
        color={color}
        captured={data.captured ?? []}
        advantage={data.advantage ?? 0}
        active={Boolean(data.active)}
      />
    </div>
  );
}

