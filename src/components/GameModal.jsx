export default function GameModal({ open, title, description, onClose, onRematch }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <img
          src="/assets/icons/logo-horse.png"
          alt="Chess Trainer"
          className="modal-logo"
        />
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">{description}</p>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Terminer
          </button>
          <button className="btn btn-primary" onClick={onRematch}>
            Revanche
          </button>
        </div>
      </div>
    </div>
  );
}

