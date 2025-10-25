import { useEffect, useState } from "react";
import { getVolume, isMuted, setMuted, setVolume, initOnUserGesture } from "../audio/SoundManager";

export default function RightMenu() {
  const [muted, setMutedState] = useState(isMuted());
  const [volume, setVolumeState] = useState(getVolume());

  useEffect(() => {
    initOnUserGesture();
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };
  const onVol = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    setVolumeState(v);
  };

  const iconStyle = {
    width: 32,
    height: 'auto',
    maxWidth: 32,
    filter: 'brightness(1.2) sepia(1) hue-rotate(20deg) saturate(2)'
  };

  return (
    <div className="aside">
      <div className="panel-title">Jouer aux échecs</div>
      <div className="menu">
        <button className="menu-item">
          <img src="/assets/icons/icon-online.png" alt="Jouer en ligne" style={iconStyle} />
          <span>Jouer en ligne</span>
        </button>
        <button className="menu-item">
          <img src="/assets/icons/icon-engine.png" alt="Jouer contre l'IA" style={iconStyle} />
          <span>Jouer contre l'IA</span>
        </button>
        <button className="menu-item">
          <img src="/assets/icons/icon-friends.png" alt="Jouer avec un ami" style={iconStyle} />
          <span>Jouer avec un ami</span>
        </button>
        <button className="menu-item">
          <img src="/assets/icons/icon-variants.png" alt="Variantes d'échecs" style={iconStyle} />
          <span>Variantes d'échecs</span>
        </button>
      </div>

      <div style={{ marginTop: 16 }} className="panel">
        <div style={{ padding: 12 }}>
          <div className="panel-title">Sons</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <button className="btn" onClick={toggleMute}>{muted ? '🔇 Muet' : '🔈 Actifs'}</button>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={onVol} />
          </div>
          <div className="muted">Préchargés au premier clic. Volume par défaut 0.8.</div>
        </div>
      </div>
    </div>
  );
}

