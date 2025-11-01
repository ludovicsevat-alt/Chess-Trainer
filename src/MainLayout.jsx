import LeftMenu from "./components/LeftMenu";
import RightMenu from "./components/RightMenu";
import StaticBoard from "./components/StaticBoard";
import PlayVsAI from "./components/PlayVsAI";
import PlayLocal from "./components/PlayLocal";
import { useLocalGame } from "./contexts/LocalGameContext";
import Training from "./components/Training";
import Puzzles from "./components/Puzzles";
import Stats from "./components/Stats";
import Settings from "./components/Settings";

function renderContent(menu, aiGame, gameStatus) {
  switch (menu) {
    case "ai":
      return {
        center: <PlayVsAI aiGame={aiGame} />,
        right: <RightMenu selectedMenu={menu} aiGame={aiGame} gameStatus={gameStatus} />,
      };
    case "online":
      return {
        center: <PlayLocal />,
        right: <RightMenu selectedMenu={menu} gameStatus={gameStatus} />,
      };
    case "local":
      return { center: <PlayLocal />, right: <RightMenu selectedMenu={menu} gameStatus={gameStatus} /> };
    case "training":
      return { center: <Training />, right: <RightMenu selectedMenu={menu} /> };
    case "puzzle":
      return { center: <Puzzles />, right: <RightMenu selectedMenu={menu} /> };
    case "stats":
      return { center: <Stats />, right: <RightMenu selectedMenu={menu} /> };
    case "settings":
      return { center: <Settings />, right: <RightMenu selectedMenu={menu} /> };
    case "overview":
    default:
      return { center: <StaticBoard />, right: <RightMenu selectedMenu={menu} /> };
  }
}

export default function MainLayout({
  left,
  center,
  right,
  selectedMenu = "overview",
  onSelectMenu,
  aiGame,
}) {
  const { gameStatus } = useLocalGame();
  const content = renderContent(selectedMenu, aiGame, gameStatus);

  return (
    <div className="layout">
      {left ?? <LeftMenu selected={selectedMenu} onSelect={onSelectMenu} />}
      {center ?? content.center}
      {right ?? content.right}
    </div>
  );
}
