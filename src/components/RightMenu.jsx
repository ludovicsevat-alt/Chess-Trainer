import { useEffect, useState } from 'react';
import { getVolume, isMuted, setMuted, setVolume, initOnUserGesture } from '../audio/SoundManager';

export default function RightMenu({ selectedMenu = 'overview' }) {
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
    <div className='aside'>
      {selectedMenu === 'overview' && (
        <div className='panel' style={{ padding: 16, textAlign: 'center', marginBottom: 16 }}>
          <img
            src='/assets/icons/logo-horse.png'
            alt='Logo Chess Trainer'
            style={{ width: 64, height: 'auto', marginBottom: 12 }}
          />
          <div className='panel-title' style={{ marginBottom: 8 }}>Bienvenue</div>
          <div className='muted' style={{ color: 'var(--color-accent-light)' }}>
            Bienvenue dans Chess Trainer — choisissez un mode à gauche.
          </div>
        </div>
      )}

      <div className='panel-title'>Jouer aux échecs</div>
      <div className='menu'>
        <button className='menu-item'>
          <img src='/assets/icons/icon-online.png' alt='Jouer en ligne' className='icon-golden' />
          <span>Jouer en ligne</span>
        </button>
        <button className='menu-item'>
          <img src='/assets/icons/icon-engine.png' alt="Jouer contre l'IA" className='icon-golden' />
          <span>Jouer contre l'IA</span>
        </button>
        <button className='menu-item'>
          <img src='/assets/icons/icon-friends.png' alt='Jouer avec un ami' className='icon-golden' />
          <span>Jouer avec un ami</span>
        </button>
        <button className='menu-item'>
          <img src='/assets/icons/icon-variants.png' alt="Variantes d'échecs" className='icon-golden' />
          <span>Variantes d'échecs</span>
        </button>
      </div>

      <div style={{ marginTop: 16 }} className='panel'>
        <div style={{ padding: 12 }}>
          <div className='panel-title'>Sons</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <button className='btn' onClick={toggleMute}>{muted ? '🔇 Muet' : '🔈 Actifs'}</button>
            <input type='range' min='0' max='1' step='0.05' value={volume} onChange={onVol} />
          </div>
          <div className='muted'>Préchargés au premier clic. Volume par défaut 0.8.</div>
        </div>
      </div>
    </div>
  );
}
