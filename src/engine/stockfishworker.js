// src/engine/stockfishWorker.js
// Petit proxy-Worker qui charge le worker Stockfish WASM et fait suivre les messages.

// Chemin principal : fonctionne avec Vite/CRA/webpack récents.
// Si ton bundler n'aime pas "?worker&url", regarde la variante fallback plus bas.
import stockfishUrl from 'stockfish.wasm/stockfish.js?worker&url';

let engine = null;

self.addEventListener('message', (e) => {
  const { type, payload } = e.data || {};

  // Initialisation : on crée le worker du moteur et on fait suivre les messages
  if (type === 'INIT') {
    if (engine) return; // déjà prêt
    engine = new Worker(stockfishUrl, { type: 'module' });

    engine.onmessage = (evt) => {
      // On renvoie chaque ligne du moteur au thread principal
      self.postMessage({ type: 'ENGINE_MESSAGE', payload: evt.data });
    };

    // Démarrage UCI
    engine.postMessage('uci');
    return;
  }

  // Si pas encore d'engine, on ignore
  if (!engine) return;

  // Commandes UCI (position/go/setoption/…)
  if (type === 'CMD') {
    engine.postMessage(payload);
    return;
  }

  // Arrêt propre
  if (type === 'QUIT') {
    engine.terminate();
    engine = null;
  }
});

/* =========================
   Fallback si ton bundler ne gère pas "?worker&url"
   -------------------------------------------------
   - Commente l'import du haut
   - Décommente le bloc ci-dessous
   - Laisse le reste du fichier identique
========================= */

// // Fallback :
// // const stockfishUrl = new URL('stockfish.wasm/stockfish.js', import.meta.url);
// // let engine = null;
// // self.addEventListener('message', (e) => {
// //   const { type, payload } = e.data || {};
// //   if (type === 'INIT') {
// //     if (engine) return;
// //     engine = new Worker(stockfishUrl, { type: 'module' });
// //     engine.onmessage = (evt) => self.postMessage({ type: 'ENGINE_MESSAGE', payload: evt.data });
// //     engine.postMessage('uci');
// //     return;
// //   }
// //   if (!engine) return;
// //   if (type === 'CMD') { engine.postMessage(payload); return; }
// //   if (type === 'QUIT') { engine.terminate(); engine = null; }
// // });
