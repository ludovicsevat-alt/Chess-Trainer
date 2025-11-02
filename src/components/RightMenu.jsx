import LocalGamePanel from "./LocalGamePanel";
import { useSettings } from "../contexts/SettingsContext";
import AiRightMenuContent from "./AiRightMenuContent";
import OnlineRightMenuContent from "./OnlineRightMenuContent";

export default function RightMenu({
  selectedMenu = "overview",
  aiGame,
  onlineGame,
  gameStatus,
}) {
  const { messages } = useSettings();

  const isAi = selectedMenu === "ai" && Boolean(aiGame);
  const isOnline = selectedMenu === "online" && Boolean(onlineGame);

  return (
    <div className="aside right-menu">
      {!isAi && !isOnline && selectedMenu === "overview" && (
        <div className="panel" style={{ padding: 16, textAlign: "center" }}>
          <img
            src="/assets/images/titre.png"
            alt="Chess Trainer"
            style={{ width: 64, marginBottom: 12 }}
          />
          <div className="panel-title">{messages.welcomeTitle}</div>
          <div
            className="muted"
            style={{ color: "var(--color-accent-light)" }}
          >
            {messages.welcomeHint}
          </div>
        </div>
      )}

      {isAi && <AiRightMenuContent aiGame={aiGame} />}

      {selectedMenu === "local" && <LocalGamePanel gameStatus={gameStatus} />}

      {isOnline && <OnlineRightMenuContent onlineGame={onlineGame} />}
    </div>
  );
}
