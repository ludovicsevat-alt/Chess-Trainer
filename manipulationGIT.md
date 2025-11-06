# 🧭 Workflow Git – Branches *main* & *work*

## 🔹 Structure des branches

- **work** : branche de développement — c’est ici que tu codes, testes, expérimentes.
- **main** : branche stable — ne contient que les versions validées et fonctionnelles.

---

## 🚀 Routine de mise à jour

### 1. Synchroniser la branche de travail
```bash
git checkout work
git pull origin work
```

### 2. Fusionner les changements validés du `main` dans `work`
```bash
git merge main
```
*(Résous les conflits si Git en trouve, puis commit.)*

### 3. Après validation et tests, pousser `work` vers `main`
```bash
git checkout main
git merge work
git push origin main
```

### 4. Revenir sur `work` pour continuer le développement
```bash
git checkout work
```

---

## 🧩 Notes pratiques

- **main** : ne contient que du code testé et fonctionnel.  
- **work** : libre pour tes expérimentations avec Codex, Gemini, etc.
- En cas de gros bug, restaure la branche de travail depuis `main` :
  ```bash
  git reset --hard origin/main
  ```

### 🗂️ Convention de commits
- `feat:` → nouvelle fonctionnalité
- `fix:` → correction de bug
- `refactor:` → réorganisation de code
- `test:` → essai ou expérimentation

---

## 💡 Conseils
- Pense à commit régulièrement (même les petits changements).
- Un merge de `work` vers `main` doit toujours être précédé de tests complets.
- Pour voir les différences avant de fusionner :
  ```bash
  git diff main
  ```
