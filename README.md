# ♟️ Chess-Trainer V2

Une application React de formation aux ouvertures d’échecs utilisant **Stockfish** intégré localement en Web Worker.  
Le moteur est embarqué directement dans le navigateur, sans dépendance externe ni WebAssembly distant.

## 🚀 Fonctionnalités
- Moteur **Stockfish** fonctionnel via sous-worker.  
- Interface React + Vite + Tailwind CSS.  
- Sauvegarde Git et scripts d’automatisation.  
- Version stable vérifiée (13 octobre 2025).

## 🛠️ Scripts disponibles
| Commande | Action |
|-----------|--------|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Compiler le projet pour production |
| `npm run preview` | Prévisualiser la version buildée |
| `npm run checkpoint` | Commit + push rapide |
| `npm run zip` | Crée une sauvegarde compressée |
| `npm run clean` | Nettoie le dossier `dist` |

## 💾 Installation rapide
```bash
git clone https://github.com/ludovicsevat-alt/Chess-Trainer.git
cd Chess-Trainer
npm install
npm run dev
