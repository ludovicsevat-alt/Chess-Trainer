import {
  FaChartBar,
  FaChessKnight,
  FaCog,
  FaDumbbell,
  FaGlobe,
  FaPuzzlePiece,
  FaRobot,
  FaUsers,
} from "react-icons/fa";
import { useSettings } from "../contexts/SettingsContext";

const NAV_ITEMS = [
  { id: "overview", icon: FaChessKnight },
  { id: "online", icon: FaGlobe },
  { id: "ai", icon: FaRobot },
  { id: "local", icon: FaUsers },
  { id: "training", icon: FaDumbbell },
  { id: "puzzle", icon: FaPuzzlePiece },
  { id: "stats", icon: FaChartBar },
  { id: "settings", icon: FaCog },
];

export default function LeftMenu({ selected = "overview", onSelect }) {
  const { messages } = useSettings();

  return (
    <div className="sidebar left-menu">
      <div className="brand" style={{ gap: 0, marginBottom: 24 }}>
        <img
          src="/assets/images/titre.png"
          alt="Chess Trainer"
          className="brand-logo"
        />
      </div>

      <div className="nav-list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const copy = messages.nav[item.id] ?? { title: item.id, subtitle: "" };
          return (
            <button
              key={item.id}
              onClick={() => onSelect && onSelect(item.id)}
              className={`nav-card ${selected === item.id ? "active" : ""}`}
            >
              <div className="nav-icon">
                <Icon />
              </div>
              <div className="nav-text">
                <div className="nav-title">{copy.title}</div>
                <div className="nav-subtitle">{copy.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="nav-footer">
        <span>v0.1 - Dev</span>
      </div>
    </div>
  );
}
