import { useState } from "react";
import MainLayout from "./MainLayout";
import useAiGame from "./hooks/useAiGame";
import useOnlineGame from "./hooks/useOnlineGame";
import { LocalGameProvider } from "./contexts/LocalGameContext";
import { SettingsProvider } from "./contexts/SettingsContext";

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const aiGame = useAiGame();
  const isOnline = selectedMenu === "online";
  const onlineGame = useOnlineGame("white", { enabled: isOnline });

  const handleSelect = (id) => {
    setSelectedMenu(id);
    if (id !== "ai") {
      aiGame.resetMode();
    }
  };

  return (
    <SettingsProvider>
      <LocalGameProvider>
        <MainLayout
          selectedMenu={selectedMenu}
          onSelectMenu={handleSelect}
          aiGame={aiGame}
          onlineGame={onlineGame}
          isOnlineEnabled={isOnline}
        />
      </LocalGameProvider>
    </SettingsProvider>
  );
}

