export default function LeftMenu({ selected = "static", onSelect }) {
  const Item = ({ id, label, icon }) => (
    <button
      onClick={() => onSelect && onSelect(id)}
      className={`menu-item ${id === selected ? 'active' : ''}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="sidebar">
      <div className="brand" style={{gap: 0, marginBottom: 20}}>
        <img
          src="/assets/images/titre.png"
          alt="Chess Trainer"
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>

      <div className="menu">
        <Item id="static" label="Aperçu échiquier" icon="🏁" />
        <Item id="engine" label="Jouer contre IA" icon="🤖" />
      </div>

      <div style={{marginTop: 'auto'}} className="muted">v0.1 — Dev</div>
    </div>
  );
}
