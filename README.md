# 🏰 Chess-Trainer – Golden King Edition

## 🎯 Objectif du projet
Chess-Trainer est une plateforme d’entraînement aux échecs construite avec **React**, **Stockfish**, et **React-Chessboard**, combinant pédagogie, immersion et analyse avancée.  
Elle propose plusieurs modes de jeu (local, IA, en ligne, entraînement guidé…) dans une atmosphère **médiévale dorée** inspirée du thème “Golden King”.

---

## ⚙️ Stack technique
- **Frontend :** React 18 (CRA), TailwindCSS, ShadCN/UI, Framer Motion  
- **Moteur d’échecs :** Stockfish (WASM + worker)  
- **Librairies clés :**  
  - `chess.js` – logique des coups  
  - `react-chessboard` – rendu interactif du plateau  
  - `socket.io` – multijoueur temps réel  
- **Audio & UI :** sons personnalisés, thème doré, ambiance médiévale  
- **Langage principal :** JavaScript (ES2022)

---

## 🧩 Modes de jeu
| Mode | Description |
|------|--------------|
| **Jouer localement** | Deux joueurs humains sur le même appareil |
| **Contre l’IA** | Affrontez Stockfish « humanisé » selon un ELO choisi |
| **En ligne** | Jouez contre un adversaire distant via Socket.IO |
| **Mode entraînement** | Apprentissage guidé des ouvertures, avec un “coach” qui explique les coups |
| **Mode scénario** | Rejouez des ouvertures ou positions pré-définies (système JSON pédagogique) |

---

## 🧠 Intelligence artificielle « humanisée »
L’IA **Humanized Stockfish** adapte son comportement au niveau ELO :

- Joue avec **erreurs progressives** et **probabilités de gaffes** selon le niveau.  
- Utilise un système de **pondération aléatoire** pour choisir des coups non optimaux.  
- Est calibrée sur les performances observées sur **Chess.com** (≈ comparable à un joueur humain de même ELO).  
- Chaque niveau ajuste : `skillLevel`, `depth`, `noise`, et sélection de coups via un tirage pondéré.

---

## 🧮 Évaluation des performances (Phase 8)
Une fois la partie terminée, le moteur analyse :
- Les coups du joueur et de l’IA via Stockfish.  
- Le **ACPL** (Average Centipawn Loss = perte moyenne en centièmes de pion).  
- Une **estimation d’ELO** basée sur la précision moyenne du joueur.  
- Une comparaison entre le niveau configuré et la performance réelle de l’IA.  

Affichage prévu :
- Score de performance (“Performance estimée : 1275 ELO”)  
- Graphique des erreurs, blunders et bonnes séquences.  
- Option d’analyse automatique dans les paramètres.

---

## 🧰 Phases du projet

### 1. Audio & ambiance ✅
- Intégration des sons (déplacement, roque, échec, victoire, etc.)  
- Nettoyage des assets et cohérence thématique.

### 2. Interface & affichage ✅
- Refonte complète du layout (RightMenu, MoveNavigator).  
- Thème doré, responsive, suppression des barres de scroll inutiles.

### 3. Mode entraînement (en cours)
- Lecture des **scénarios JSON d’ouvertures** : coups attendus, indices, explications.  
- IA humanisée selon ELO choisi.  
- Coach : indique, corrige et explique les coups.  
- Système de progression visuelle et indices graduels.

### 4. Mode en ligne (en cours)
- Restauration du backend Socket.IO.  
- Gestion des connexions/déconnexions :  
  - Attente 10 s avant défaite automatique.  
  - Statut “déconnecté” affiché.  
- Synchronisation propre des états de partie.

### 5. UX/UI polish (à venir)
- Ajustement des colonnes et tailles.  
- Texte du coach, animations légères.  
- Accessibilité et feedback visuel (erreurs, invalides, etc.).  

### 6. Bilan de partie (à venir)
- Barre d’avantage verticale (type Lichess).  
- Relecture commentée avec évaluations Stockfish.  
- Annotation couleur (blunder, inaccuracy, good move).  
- Mode **Analyse interactive** : rejouer une position clé comme exercice.

### 7. Maintenance & automatisation (à venir)
- Script `npm run context` pour générer la synthèse du projet via Code2Prompt.  
- ESLint / Prettier.  
- Intégration CI GitHub Actions.

### 8. Évaluation des performances (en cours de design)
- Calcul automatique d’un ELO estimé pour le joueur et pour l’IA.  
- Analyse rétrospective des parties.  
- Indicateurs dans GameModal.jsx.

### 9. Bonus & tests (futur)
- IA vs humain : performance comparative.  
- Mode local humain vs humain.  
- Tests unitaires et vérifications WASM.

---

## 🧱 Architecture simplifiée

```
src/
 ├── components/
 │    ├── PlayLocal.jsx
 │    ├── PlayVsAI.jsx
 │    ├── RightMenu.jsx
 │    ├── BoardView.jsx
 │    ├── GameModal.jsx
 │    └── ...
 ├── engine/
 │    ├── stockfishWorker.js
 │    ├── HumanizedStockfish.js
 │    └── ...
 ├── hooks/
 │    ├── useAiGame.js
 │    ├── useOnlineGame.js
 │    └── useLocalGame.js
 ├── assets/
 │    ├── sounds/
 │    ├── images/
 │    └── themes/
 └── constants/
      └── levels.js
```

---

## 🎨 Thème « Golden King »
- Palette : or, noir profond, et parchemin.  
- Sons : bois, métal, ambiance médiévale.  
- Fonts : *Cinzel*, *MedievalSharp* ou variantes gothiques.  
- Icônes : boucliers, couronnes, parchemins.

---

## 🧪 Commandes utiles

```bash
# Lancer le projet
npm start

# Générer le contexte pour Codex (résumé du code)
npm run context

# Lancer les tests
npm test

# Build de production
npm run build
```

---

## 🏗️ Déploiement
- Hébergement sur **GitHub Pages**.  
- Action GitHub automatique pour build et push.  
- Branche de travail : `work`  
- Branche stable : `main`

---

## 🧾 Licence
Projet open-source sous licence MIT.  
Créé par **Ludovic Sévat (Aspion)**, 2025.
