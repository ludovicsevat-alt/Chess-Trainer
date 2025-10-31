import { useLocalGame } from "../contexts/LocalGameContext";
import GameHistoryPanel from "./GameHistoryPanel";
import { FaSyncAlt } from "react-icons/fa";
import { useSettings } from "../contexts/SettingsContext";

export default function LocalGamePanel() {
  const { history, resetGame, currentPly } = useLocalGame();
  const { messages } = useSettings();

  return (
    <>
      <div className="ai-title">{messages.localTitle}</div>

      <button
        onClick={resetGame}
        className="btn-primary"
        style={{ marginBottom: 24 }}
      >
        <FaSyncAlt /> {messages.startMatch}
      </button>

      <GameHistoryPanel history={history} activePly={currentPly} />
    </>
  );
}
