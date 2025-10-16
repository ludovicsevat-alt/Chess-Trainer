import { useEffect, useRef, useState, useCallback } from "react";

// Niveaux IA (skill/elo + temps par coup en ms)
const PRESETS = {
  1: { Skill: 1,  ELO: 800,  MoveTime: 350 },
  2: { Skill: 3,  ELO: 1000, MoveTime: 500 },
  3: { Skill: 6,  ELO: 1200, MoveTime: 750 },
  4: { Skill: 10, ELO: 1400, MoveTime: 1000 },
  5: { Skill: 15, ELO: 1600, MoveTime: 1200 },
  6: { Skill: 20, ELO: 1800, MoveTime: 1400 },
  7: { Skill: 20, ELO: 2000, MoveTime: 1700 },
  8: { Skill: 20, ELO: 2200, MoveTime: 2000 },
};

// Deux CDNs testés. On essaye jsDelivr, puis unpkg en secours.
const STOCKFISH_CDNS = [
  "https://cdn.jsdelivr.net/gh/niklasf/stockfish.wasm/stockfish.js",
  "https://unpkg.com/stockfish@15.1.1/stockfish.js",
];

export function useStockfish({ level = 3 } = {}) {
  const engineRef = useRef(null);      // Worker
  const [ready, setReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [lastInfo, setLastInfo] = useState(null);

  const send = useCallback((cmd) => {
    const eng = engineRef.current;
    if (!eng) return;
    console.log("%c[SEND ➤]", "color:#0af", cmd);
    eng.postMessage(cmd);
  }, []);

  useEffect(() => {
    // Crée un worker "classique" (pas module) qui charge Stockfish via importScripts.
    // On génère un blob avec un petit bootstrap et on tente plusieurs CDNs.
    const bootstrap = `
      (async () => {
        const cdns = ${JSON.stringify(STOCKFISH_CDNS)};
        let loaded = false;
        for (const url of cdns) {
          try {
            importScripts(url);
            // global STOCKFISH fourni par le script
            if (typeof STOCKFISH === "function") {
              const sf = STOCKFISH();
              sf.onmessage = (e) => postMessage(e.data);
              onmessage = (e) => sf.postMessage(e.data);
              postMessage("engine:loaded:" + url);
              loaded = true;
              break;
            }
          } catch (e) {
            // On essaie le CDN suivant
          }
        }
        if (!loaded) {
          postMessage("engine:error:failed_to_load_all_cdns");
        }
      })();
    `;
    const blob = new Blob([bootstrap], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const engine = new Worker(url); // worker non-module = plus compatible
    engineRef.current = engine;

    const onMsg = (e) => {
      const line = String(e.data || "");
      console.log("%c[ENGINE ➤]", "color:#6f6", line);

      if (line.startsWith("engine:loaded:")) {
        // Handshake UCI
        send("uci");
        return;
      }
      if (line.startsWith("engine:error:")) {
        console.error("[ENGINE ERROR]", line);
        return;
      }
      if (line.includes("uciok")) {
        const p = PRESETS[level] || PRESETS[3];
        send(`setoption name Skill Level value ${p.Skill}`);
        send(`setoption name UCI_Elo value ${p.ELO}`);
        send("isready");
        return;
      }
      if (line.includes("readyok")) {
        setReady(true);
        return;
      }
      if (line.startsWith("info")) {
        setLastInfo(line);
        return;
      }
      if (line.startsWith("bestmove")) {
        setThinking(false);
        return;
      }
    };

    const onErr = (e) => console.error("[ENGINE ERROR]", e);

    engine.addEventListener("message", onMsg);
    engine.addEventListener("error", onErr);

    return () => {
      engine.removeEventListener("message", onMsg);
      engine.removeEventListener("error", onErr);
      engine.terminate();
      engineRef.current = null;
      setReady(false);
      setThinking(false);
      setLastInfo(null);
      URL.revokeObjectURL(url);
    };
  }, [level, send]);

  const go = useCallback(
    (fen) => {
      if (!engineRef.current || !ready) return;
      const p = PRESETS[level] || PRESETS[3];
      setThinking(true);
      send(`position fen ${fen}`);
      send(`go movetime ${p.MoveTime}`);
    },
    [ready, level, send]
  );

  // Attache un écouteur temporaire pour récupérer le prochain "bestmove"
  const onceBestMove = useCallback(() => {
    return new Promise((resolve) => {
      const handler = (e) => {
        const line = String(e.data || "");
        if (line.startsWith("bestmove")) {
          const mv = line.split(" ")[1]; // "e2e4"
          engineRef.current?.removeEventListener("message", handler);
          resolve(mv);
        }
      };
      engineRef.current?.addEventListener("message", handler);
    });
  }, []);

  const newGame = useCallback(() => {
    send("ucinewgame");
    send("isready");
  }, [send]);

  return { ready, thinking, lastInfo, go, onceBestMove, newGame };
}
