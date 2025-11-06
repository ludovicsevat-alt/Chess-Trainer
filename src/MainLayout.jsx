import React, { useState } from "react";
import LeftMenu from "./components/LeftMenu";
import RightMenu from "./components/RightMenu";
import StaticBoard from "./components/StaticBoard";
import PlayVsAI from "./components/PlayVsAI";
import PlayLocal from "./components/PlayLocal";
import PlayOnline from "./components/PlayOnline";
import { useLocalGame } from "./contexts/LocalGameContext";
import Training from "./components/Training";
import Puzzles from "./components/Puzzles";
import Stats from "./components/Stats";
import Settings from "./components/Settings";
import LondonTheory from "./pages/openings/LondonTheory";
import LondonTheoryRightMenu from "./components/LondonTheoryRightMenu";
import { TrainingSessionProvider } from "./contexts/TrainingSessionContext";
import TrainingBoard from "./components/TrainingBoard";
import TrainingRightMenuContent from "./components/TrainingRightMenuContent";

function renderContent(
  menu,
  { aiGame, localGame, onlineGame },
  trainingSelection,
  setTrainingSelection
) {
  switch (menu) {
    case "ai":
      return {
        center: <PlayVsAI aiGame={aiGame} />,
        right: (
          <RightMenu
            selectedMenu={menu}
            aiGame={aiGame}
            gameStatus={aiGame?.gameStatus}
          />
        ),
      };
    case "online":
      return {
        center: <PlayOnline onlineGame={onlineGame} />,
        right: (
          <RightMenu
            selectedMenu={menu}
            onlineGame={onlineGame}
            gameStatus={onlineGame?.gameStatus}
          />
        ),
      };
    case "local":
      return {
        center: <PlayLocal />,
        right: (
          <RightMenu
            selectedMenu={menu}
            gameStatus={localGame?.gameStatus}
          />
        ),
      };
    case "training":
      if (trainingSelection) {
        if (
          trainingSelection.type === "theory" &&
          trainingSelection.slug === "london-system"
        ) {
          return {
            center: <LondonTheory />,
            right: <LondonTheoryRightMenu setTrainingSelection={setTrainingSelection} />,
          };
        }
        return { center: null, right: null };
      }
      return {
        center: <Training onSelect={setTrainingSelection} />,
        right: <RightMenu selectedMenu={menu} />,
      };
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
  onlineGame,
}) {
    const [trainingSelection, setTrainingSelection] = useState(null);
    const localGame = useLocalGame();
  
    const memoizedContent = React.useMemo(() => renderContent(
      selectedMenu,
      { aiGame, localGame, onlineGame },
      trainingSelection,
      setTrainingSelection
    ), [selectedMenu, aiGame, localGame, onlineGame, trainingSelection, setTrainingSelection]);
  
    if (
      selectedMenu === "training" &&
      trainingSelection &&
      trainingSelection.type === "trainer"
    ) {
      return (
        <TrainingSessionProvider
          openingSlug={trainingSelection.slug}
          side={trainingSelection.side ?? "white"}
          onExit={() => setTrainingSelection(null)}
        >
          <div className="layout">
            {left ?? <LeftMenu selected={selectedMenu} onSelect={onSelectMenu} />}
            <div className="layout-center">
              {center ?? <TrainingBoard />}
            </div>
            <TrainingRightMenuContent />
          </div>
        </TrainingSessionProvider>
      );
    }
  
    const isTrainingContent = selectedMenu === "training" && !trainingSelection;
  
    return (
      <div className="layout">
        {left ?? <LeftMenu selected={selectedMenu} onSelect={onSelectMenu} />}
        <div className={`layout-center ${isTrainingContent ? 'is-grid-content' : ''}`}>{center ?? memoizedContent.center}</div>
        {right ?? memoizedContent.right}
      </div>
    );
  }
