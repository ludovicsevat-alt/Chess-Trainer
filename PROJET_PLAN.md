♟️ Plan Chess-Trainer
Version mise à jour — 2 novembre
🥁 Phase 1 — Audio & ambiance

✅ Ajout du son du roque
✅ Tests et validation des sons (mouvement, capture, échec, victoire)
✅ Nettoyage du dossier public/sounds/

Statut : Terminé
Priorité : —

🖼️ Phase 2 — Interface & affichage

✅ Refonte du panneau de replay (flèches dorées, intégration dans RightMenu)
✅ Uniformisation des layouts (MainLayout, PlayLocal, PlayVsAI, PlayOnline)
✅ Correction du redimensionnement dynamique et du débordement du board
✅ Application du thème doré sur tous les panneaux
✅ Suppression des scrollbars parasites

Statut : Terminé
Priorité : —

🎓 Phase 3 — Mode Entraînement (en développement)

🧱 Nouveau mode basé sur les ouvertures (menu central avec 3 cartes fictives)
🧱 Choix entre “Apprendre” et “Contrer” une ouverture
🧱 Panneau droit “Mode Entraînement” prêt pour intégration du coach
🧱 Fond et menus désormais fixes, centrage stable du contenu

Statut : En développement
Priorité : ⭐⭐

🌐 Phase 4 — Mode En ligne (en cours de restauration)

⚙️ Restauration du backend Socket.IO et du hook useOnlineGame
⚙️ Gestion automatique de reconnexion (10 s)
⚙️ Ajustement du centrage + responsive (Gemini en cours)
⚙️ Simulation de test réseau prévue

Statut : En cours
Priorité : ⭐⭐⭐

✨ Phase 5 — Finitions UX / UI (à venir)

💄 Ajustement visuel du BoardView et des PlayerInfoPanels
💄 Intégration du texte “coach” dans le panneau droit (RightMenu)
💄 Réglage des tailles relatives (board + panneaux latéraux)
💄 Ajout d’effets visuels dorés : reflets, flottement, transitions douces

Statut : À venir
Priorité : ⭐⭐

📊 Phase 6 — Bilan de partie (planifié)

📈 Analyse Stockfish complète : bons coups, erreurs, blunders
📈 Barre d’avantage verticale façon Lichess
📈 “Analyse interactive” : rejouer les positions clés comme exercices

Statut : Planifié
Priorité : ⭐⭐⭐

⚙️ Phase 7 — Maintenance & automatisation (planifié)

🧹 Script npm run context pour générer automatiquement un résumé du projet
🧹 Ajout de ESLint / Prettier / GitHub Actions

Statut : Planifié
Priorité : ⭐⭐

🧪 Phase 8 — Bonus & tests (planifié)

🎯 Mode humain vs humain local
🎯 IA vs joueur humain (analyse comparative)
🎯 Tests unitaires

Statut : Planifié
Priorité : ⭐

⚙️ Annexe — Évolutions à planifier
🧩 Page Paramètres

    Refonte sous forme de modal ou drawer pour éviter de quitter une partie.

🧩 Modal de fin de partie

    Nouvelle version esthétique et complète, à la manière de Chess.com :

    résumé du match,

    statistiques,

    notation de performance.