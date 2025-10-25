import { useState } from "react";
import MainLayout from "./MainLayout";
import useAiGame from "./hooks/useAiGame";

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const aiGame = useAiGame();

  const handleSelect = (id) => {
    setSelectedMenu(id);
    if (id !== "ai") {
      aiGame.resetMode();
    }
  };

  return (
    <MainLayout
      selectedMenu={selectedMenu}
      onSelectMenu={handleSelect}
      aiGame={aiGame}
    />
  );
}
