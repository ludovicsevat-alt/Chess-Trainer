import { useState } from "react";
import MainLayout from "./MainLayout";
import useAiGame from "./hooks/useAiGame";
import { LocalGameProvider } from "./contexts/LocalGameContext";
import { SettingsProvider } from "./contexts/SettingsContext";

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const aiGame = useAiGame();

  const handleSelect = (id) => {
    setSelectedMenu(id);
    if (id !== "ai") {
      aiGame.resetMode();
    }
  };

  const content =
    selectedMenu === "local" ? (
      <LocalGameProvider>
        <MainLayout
          selectedMenu={selectedMenu}
          onSelectMenu={handleSelect}
          aiGame={aiGame}
        />
      </LocalGameProvider>
    ) : (
      <MainLayout
        selectedMenu={selectedMenu}
        onSelectMenu={handleSelect}
        aiGame={aiGame}
      />
    );

  return <SettingsProvider>{content}</SettingsProvider>;
}

