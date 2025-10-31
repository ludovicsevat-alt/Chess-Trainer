import { useState } from "react";
import MainLayout from "./MainLayout";
import useAiGame from "./hooks/useAiGame";
import { LocalGameProvider } from "./contexts/LocalGameContext"; // ← import ajouté

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const aiGame = useAiGame();

  const handleSelect = (id) => {
    setSelectedMenu(id);
    if (id !== "ai") {
      aiGame.resetMode();
    }
  };

  // --- Rendu conditionnel ---
  // On enveloppe MainLayout avec LocalGameProvider uniquement pour le mode local
  if (selectedMenu === "local") {
    return (
      <LocalGameProvider>
        <MainLayout
          selectedMenu={selectedMenu}
          onSelectMenu={handleSelect}
          aiGame={aiGame}
        />
      </LocalGameProvider>
    );
  }

  // --- Pour tous les autres modes ---
  return (
    <MainLayout
      selectedMenu={selectedMenu}
      onSelectMenu={handleSelect}
      aiGame={aiGame}
    />
  );
}
