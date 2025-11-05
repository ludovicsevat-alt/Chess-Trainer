# ♔ Chess-Trainer — Plan global et avancement (Novembre 2025)

## ⚔️ Thème & Identité
- Style **Golden King** : ambiance médiévale dorée, interface parcheminée, sons personnalisés.
- Objectif : créer une plateforme complète d’apprentissage et de jeu : local, IA, en ligne, entraînement, analyse, bilan, et progression.

---

## 🧩 Tableau d’avancement

| Phase | Nom | Description synthétique | Statut |
|:------|:----|:------------------------|:--------|
| **1** | **Audio & Ambiance** | Sons personnalisés (déplacement, capture, roque, victoire/défaite). Nettoyage complet des assets audio. Ambiance immersive “Golden King”. | ✅ Terminé |
| **2** | **Interface & Affichage** | Refactor complet du layout (`MainLayout`, `RightMenu`, `MoveNavigator`). Unification visuelle, responsive, correction des scrollbars. Thème doré finalisé. | ✅ Terminé |
| **3** | **Mode Entraînement** | 4 sous-modes : **Théorie**, **Apprendre**, **Appliquer**, **Scénario guidé**. Coach utilisant des fichiers JSON riches (London, Jobava, Fianchetto…). IA humanisée. | ⚙️ En cours |
| **4** | **Mode En ligne** | Rétablissement du backend Socket.IO. Reconnexion automatique, timeout, victoire par déconnexion. Synchronisation des coups et rematch. | ⚙️ En cours |
| **5** | **UX / UI Polish** | Ajustement du layout central, animations subtiles, sons de menus, amélioration de la lisibilité du coach. | 🧩 À faire |
| **6** | **Paramètres** | Page **Paramètres** sous forme de modal ou drawer, accessible sans quitter la partie. Réglages : son, ELO IA, thème, coach vocal, etc. Sauvegarde locale. | 🧩 À faire |
| **7** | **Fin de partie (GameModal)** | Refonte esthétique et fonctionnelle. Détails : score, statistiques, durée, type de victoire, téléchargement PGN/SAN. | ⚙️ En test |
| **8** | **Évaluation ELO & Humanisation** | Calcul post-partie du **CPL / ACPL**, estimation ELO du joueur et de l’IA, comparaison avec l’ELO configuré, affichage dans la GameModal. Calibration future de l’IA. | 🧩 À implémenter |
| **9** | **Bilan de partie & Analyse interactive** | Barre d’avantage (type Lichess), explications du coach, historique coloré (bon/mauvais coups), et mode “rejouer les positions clés”. | 🧩 À concevoir |
| **10** | **Maintenance & Automatisation** | Script `npm run context` (code2prompt), intégration ESLint / Prettier, pipeline GitHub Actions build + deploy, cohérence assets. | 🧩 À faire |
| **11** | **Bonus & Tests** | Modes supplémentaires (local vs IA, humain vs humain), tests unitaires, calibrage IA humanisée. | 🧩 À venir |
| **12** | **Extensions futures** | TTS coach vocal, historique ELO joueur, génération automatique de scénarios (Gemini), synchronisation cloud. | 💤 Optionnel |

---

## 🧱 Détails complets par phase

### **Phase 1 — Audio & Ambiance** ✅  
- Sons : déplacement, capture, roque, échec, victoire/défaite.  
- Nettoyage des fichiers et uniformisation du volume.  
- Thème sonore cohérent (parchemin, carillons, ambiance médiévale).

---

### **Phase 2 — Interface & Affichage** ✅  
- Refactor de toute la structure React.  
- Menus gauche/droite isolés dans leurs composants.  
- Responsive, proportions du board corrigées, scrollbars supprimées.  
- Thème doré et polices médiévales finales.

---

### **Phase 3 — Mode Entraînement** ⚙️  
**Sous-modes :**  
1. **Théorie** : présentation textuelle et visuelle de l’ouverture.  
2. **Apprendre** : le coach indique chaque coup.  
3. **Appliquer** : le joueur pratique contre l’IA humanisée.  
4. **Scénario guidé** : parties préconstruites avec variantes aléatoires.  

**Système de données :**  
- JSON par ouverture : coups attendus, indices, explications, branches.  
- Ouvertures actuelles : London, Jobava, Fianchetto.  
- Coach vocal/textuel avec Stockfish.  
- Tolérance de jeu selon ELO.

---

### **Phase 4 — Mode En ligne** ⚙️  
- Reconnexion automatique via Socket.IO.  
- Synchronisation des états de partie (roomId, moves).  
- Message “déconnecté / reconnecté” + victoire si timeout.  
- Interface unifiée avec mode local.

---

### **Phase 5 — UX / UI Polish** 🧩  
- Centrage des colonnes, alignements, marges, padding.  
- Animations subtiles (mouvements de pièces, transitions menus).  
- Sons contextuels (hover, menu, retour).  
- Affinage visuel du panneau coach.

---

### **Phase 6 — Paramètres** 🧩  
- Modal / drawer latéral accessible en jeu.  
- Réglages : volume, niveau IA, thème, animations, coach vocal.  
- Sauvegarde localStorage.  
- UI cohérente avec le thème principal.

---

### **Phase 7 — Fin de partie (GameModal)** ⚙️  
- Refonte graphique avec fond parcheminé.  
- Statistiques : score, durée, erreurs, captures, temps.  
- Affichage PGN + SAN + bouton Télécharger.  
- Préparation pour analyse ELO et bilan post-partie.

---

### **Phase 8 — Évaluation ELO & Humanisation** 🧩  
- Analyse Stockfish post-partie (chaque FEN rejouée).  
- Calcul CPL / ACPL pour chaque camp.  
- Estimation ELO du joueur et de l’IA.  
- Comparaison ELO configuré vs ELO réel.  
- Affichage dans GameModal :  
  > _“Performance estimée : 1275 ELO (IA réelle : 920 ELO)”_  
- Option “Activer analyse ELO” dans Paramètres.  
- Calibration future de l’humanisation IA.

---

### **Phase 9 — Bilan de partie & Analyse interactive** 🧩  
- Barre verticale d’avantage (type Lichess).  
- Historique coloré : vert (bon), orange (imprécis), rouge (erreur).  
- Coach expliquant chaque écart : “le meilleur coup était…”.  
- Mode “rejouer les positions clés” : exercices interactifs.  
- Intégration Stockfish / coach vocal / textuel.  
- Base du futur mode “Progression”.

---

### **Phase 10 — Maintenance & Automatisation** 🧩  
- Script `npm run context` (code2prompt).  
- ESLint / Prettier / format automatique.  
- GitHub Actions : build + deploy (GitHub Pages).  
- Nettoyage des warnings et cohérence des assets.

---

### **Phase 11 — Bonus & Tests** 🧩  
- Mode local IA vs humain / humain vs humain.  
- Tests unitaires sur les hooks et mécaniques de jeu.  
- Calibration IA humanisée (selon résultats ELO).  
- Vérifications multi-ELO (400 → 2000).

---

### **Phase 12 — Extensions futures** 💤  
- Coach vocal (TTS temps réel).  
- Historique ELO joueur + progression visuelle.  
- Génération automatique de scénarios via Gemini.  
- Synchronisation cloud des profils et ouvertures.

---

## 📊 Résumé d’état actuel

| Catégorie | Progrès estimé |
|------------|----------------|
| Base technique & ambiance | ✅ 100 % |
| Interface & menus | ✅ 100 % |
| Entraînement & coach | ⚙️ ≈ 70 % |
| IA Humanisée | ⚙️ ≈ 85 % |
| Online / Socket.IO | ⚙️ ≈ 60 % |
| Analyse & bilan | 🧩 ≈ 20 % |
| Automatisation / tests | 🧩 0 % |
| Extensions futures | 💤 en veille |

---

## ✨ Prochaines étapes suggérées
1. **Finaliser le mode Entraînement** (plusieurs variantes London, Jobava, Fianchetto).  
2. **Stabiliser le mode en ligne** avant l’analyse post-partie.  
3. **Implémenter la phase 8 (Évaluation ELO)** avec Codex.  
4. **Mettre à jour la GameModal** : ELO, stats, analyse.  
5. **Démarrer la phase 9 (Bilan)** : barre d’avantage + coach explicatif.

---

> _Dernière mise à jour : Novembre 2025_  
> _Auteur : Ludovic Sévat (Aspion)_
