import { useSettings } from "../contexts/SettingsContext";

export default function LondonTheoryRightMenu({ setTrainingSelection }) {
  const { messages } = useSettings();

  const handleLearnOpening = (side) => {
    setTrainingSelection({ type: "trainer", slug: "london-system", side });
  };

  const handleBackToMenu = () => {
    setTrainingSelection(null);
  };

  return (
    <div className="aside right-menu">
      <div className="panel">
        <div className="panel-title">
          {messages.openingCourseTitle || "Cours d'ouverture"}
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <button className="btn-primary" onClick={() => handleLearnOpening("white")}>
            Apprendre l'ouverture
          </button>
          <button className="btn-secondary" onClick={() => handleLearnOpening("black")}>
            Apprendre à contrer
          </button>
          <button className="btn-tertiary" onClick={handleBackToMenu}>
            Retour au menu
          </button>
        </div>
      </div>
    </div>
  );
}
