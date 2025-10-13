// src/engine/worker.js
self.postMessage({ type: "line", data: "⚙️ Lancement du vrai worker Stockfish…" });

try {
  // Crée un worker séparé pour Stockfish (qui gère son propre code interne)
  const engine = new Worker("/stockfish.js");

  engine.onmessage = (e) => {
    const text = typeof e.data === "string" ? e.data : e.data?.data;
    if (text) self.postMessage({ type: "line", data: text });
  };

  self.onmessage = (e) => {
    const msg = e.data;
    if (typeof msg === "string") {
      engine.postMessage(msg);
    } else if (msg && msg.type === "go") {
      const { position = "startpos", moves = "", depth = 12 } = msg;
      const pos = moves ? `position ${position} moves ${moves}` : `position ${position}`;
      engine.postMessage("uci");
      engine.postMessage(pos);
      engine.postMessage(`go depth ${depth}`);
    }
  };

  self.postMessage({ type: "line", data: "✅ Stockfish initialisé via sous-worker." });
} catch (err) {
  self.postMessage({ type: "error", error: "Erreur: " + err.message });
}
