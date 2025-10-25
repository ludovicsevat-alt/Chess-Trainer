const NAV_ITEMS = [
  { id: "overview", icon: "♜", title: "Accueil", subtitle: "Aperçu échiquier" },
  { id: "ai", icon: "⚡", title: "Jouer contre l'IA", subtitle: "Stockfish" },
  { id: "local", icon: "⚔", title: "Jouer en local", subtitle: "Mode pass & play" },
  { id: "training", icon: "🎯", title: "Entraînement", subtitle: "Tactiques & finales" },
  { id: "puzzle", icon: "🧩", title: "Casse-tête", subtitle: "Défis quotidiens" },
  { id: "stats", icon: "👑", title: "Statistiques", subtitle: "Progression & ELO" },
  { id: "settings", icon: "⚙", title: "Paramètres", subtitle: "Sons & thème" }
];

export default function LeftMenu({ selected = "overview", onSelect }) {
  return (
    <div className="sidebar left-menu">
      <div className="brand" style={{ gap: 0, marginBottom: 24 }}>
        <img src="/assets/images/titre.png" alt="Chess Trainer" className="brand-logo" />
      </div>

      <div className="nav-list">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect && onSelect(item.id)}
            className={`nav-card ${selected === item.id ? "active" : ""}`}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-text">
              <div className="nav-title">{item.title}</div>
              <div className="nav-subtitle">{item.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="nav-footer">
        <span>v0.1 — Dev</span>
      </div>
    </div>
  );
}
