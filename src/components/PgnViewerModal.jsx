import React, { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";

export default function PgnViewerModal({ game, open, onClose }) {
  const { messages } = useSettings();
  const [pgn, setPgn] = useState("");
  const [san, setSan] = useState("");
  const [activeTab, setActiveTab] = useState("pgn"); // 'pgn' or 'san'

  useEffect(() => {
    if (open && game) {
      setPgn(game.pgn());
      setSan(game.history().join(" "));
    }
  }, [open, game]);

  const handleDownload = () => {
    const filename = `chess_game_${new Date().toISOString().slice(0, 10)}.${activeTab}`;
    const content = activeTab === "pgn" ? pgn : san;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{messages.pgnModalTitle}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === "pgn" ? "active" : ""}`}
              onClick={() => setActiveTab("pgn")}
            >
              PGN
            </button>
            <button
              className={`tab-button ${activeTab === "san" ? "active" : ""}`}
              onClick={() => setActiveTab("san")}
            >
              SAN
            </button>
          </div>
          <textarea
            className="pgn-textarea"
            value={activeTab === "pgn" ? pgn : san}
            readOnly
          />
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={handleDownload}>
            {messages.downloadButton}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            {messages.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
}
