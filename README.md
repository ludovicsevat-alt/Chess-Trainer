🏰 Chess Trainer — Golden King Edition
======================================

**FR :** Application d’entraînement et de jeu d’échecs construite avec **React**, mêlant esthétique médiévale dorée, moteur **Stockfish**, sons immersifs et interface moderne.  
**EN :** Chess training & playing app built with **React**, blending a “Golden King” aesthetic, **Stockfish AI**, immersive sound design, and a modern responsive UI.

---

⚙️ Fonctionnalités principales / Main Features
---------------------------------------------

- 💡 **Modes de jeu** : Pass & Play local, duel contre l’IA Stockfish, et bases du mode en ligne (joueurs, horloges).  
- 🧠 **Historique unifié** : notation SAN, icônes de pièces Unicode, surlignage du coup courant et navigation (◀▶).  
- 🔊 **Gestion sonore centralisée** : `SoundManager` (move, capture, check, checkmate, roque) avec persistance volume/mute.  
- 🎨 **Thèmes visuels** : marbre clair et marbre noir veiné d’or, accents dorés “Golden King”, sélectionnable dans Paramètres.  
- 🪶 **Interface fluide** : animations configurables, coins arrondis, panneau IA/local harmonisés, navigation responsive.  
- ⚔️ **Entraînement en préparation** : fondations pour un futur mode “coach” (analyse de coups, score matériel).

---

🧩 Structure du projet / Project Structure
-----------------------------------------

```
src/
├── audio/         # SoundManager, mapping des effets sonores
├── components/    # UI principale : menus, panneaux, échiquier, navigation
├── contexts/      # LocalGameContext, SettingsContext (thème, langue, son…)
├── hooks/         # useAiGame (Stockfish), useLocalGame (pass & play)
├── i18n/          # Textes FR/EN avec bascule dans Paramètres
├── styles/        # theme.css (thèmes marbre, layout, boutons)
└── App.jsx        # Entrée de l’app, sélection et rendu des modes
```

---

🧱 Technologies / Stack
-----------------------

- React 19 + Vite  
- CSS custom (`src/styles/theme.css`)  
- chess.js & react-chessboard  
- Stockfish (WebAssembly)  
- ESLint 9 (config moderne)

---

🎵 Ambiance & Immersion
-----------------------

> « Chaque coup résonne sur le marbre froid.  
> Les pièces d’or s’affrontent sous l’œil du Roi. »

Jeu de sons différenciés (déplacement, capture, échec, mat, roque), préchargement et persistance via `localStorage`. Les panneaux adoptent automatiquement le thème clair ou sombre pour conserver l’ambiance.

---

🛠️ Installation / Setup
-----------------------

```bash
npm install
npm run dev
```

Serveur Vite : [http://localhost:5173](http://localhost:5173)

---

🚀 Roadmap
----------

- Finaliser le mode entraînement (analyse coach, score matériel).  
- Étendre le mode en ligne (synchro horloges, réseau temps réel).  
- Export PGN/FEN, relecture détaillée et partage des parties.  
- Couverture de tests (unitaires / end-to-end).
