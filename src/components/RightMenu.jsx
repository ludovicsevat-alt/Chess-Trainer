import { useEffect, useState } from "react";
import OnlineIcon from "../icons/Online";
import EngineIcon from "../icons/Engine";
import FriendsIcon from "../icons/Friends";
import VariantsIcon from "../icons/Variants";
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

  return (
    <div className="aside">
      <div className="panel-title">Jouer aux échecs</div>
      <div className="menu">
        <button className="menu-item"><OnlineIcon /><span>Jouer en ligne</span></button>
        <button className="menu-item"><EngineIcon /><span>Jouer contre l'IA</span></button>
        <button className="menu-item"><FriendsIcon /><span>Jouer avec un ami</span></button>
        <button className="menu-item"><VariantsIcon /><span>Variantes d'échecs</span></button>
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
