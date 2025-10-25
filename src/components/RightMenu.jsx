export default function RightMenu() {
  return (
    <div className="aside">
      <div className="panel-title">Jouer aux échecs</div>
      <div className="menu">
        <button className="menu-item">
          <svg className="icon" viewBox="0 0 24 24"><path d="M13 2 L3 14 h6 l-2 8 10-12 h-6 z"/></svg>
          <span>Jouer en ligne</span>
        </button>
        <button className="menu-item">
          <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><rect x="6" y="14" width="12" height="6" rx="3"/></svg>
          <span>Jouer contre l'IA</span>
        </button>
        <button className="menu-item">
          <svg className="icon" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M4 18c0-2 2-4 4-4h0c2 0 4 2 4 4"/><path d="M12 18c0-2 2-4 4-4h0c2 0 4 2 4 4"/></svg>
          <span>Jouer avec un ami</span>
        </button>
        <button className="menu-item">
          <svg className="icon" viewBox="0 0 24 24"><path d="M12 2l2 6h6l-5 4 2 6-5-3-5 3 2-6-5-4h6z"/></svg>
          <span>Variantes d'échecs</span>
        </button>
      </div>
    </div>
  );
}
