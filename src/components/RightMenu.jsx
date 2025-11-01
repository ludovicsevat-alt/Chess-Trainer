import LocalGamePanel from "./LocalGamePanel";
import { useSettings } from "../contexts/SettingsContext";
import AiRightMenuContent from "./AiRightMenuContent";
import OnlineRightMenuContent from "./OnlineRightMenuContent";

export default function RightMenu({ selectedMenu = "overview", aiGame, gameStatus }) {
  const { messages } = useSettings();

  const isAi = selectedMenu === "ai" && Boolean(aiGame);
  const isOnline = selectedMenu === "online";

  return (
    <div className="aside right-menu">
      {!isAi && !isOnline && selectedMenu === "overview" && (
        <div className="panel" style={{ padding: 16, textAlign: "center" }}>
          <img
            src="/assets/icons/logo-horse.png"
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

      {isAi && <AiRightMenuContent aiGame={aiGame} gameStatus={gameStatus} />}

      {selectedMenu === "local" && <LocalGamePanel gameStatus={gameStatus} />}

      {isOnline && <OnlineRightMenuContent gameStatus={gameStatus} />}
    </div>
  );
}
