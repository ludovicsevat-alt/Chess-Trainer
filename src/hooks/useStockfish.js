import { useEffect, useRef, useState, useCallback } from "react";

const PRESETS = {
  1: { Skill: 1, ELO: 800, MoveTime: 350 },
  2: { Skill: 3, ELO: 1000, MoveTime: 500 },
  3: { Skill: 6, ELO: 1200, MoveTime: 750 },
  4: { Skill: 10, ELO: 1400, MoveTime: 1000 },
  5: { Skill: 15, ELO: 1600, MoveTime: 1200 },
  6: { Skill: 20, ELO: 1800, MoveTime: 1400 },
  7: { Skill: 20, ELO: 2000, MoveTime: 1700 },
  8: { Skill: 20, ELO: 2200, MoveTime: 2000 },
};

// CDN fiable (Stockfish WASM)
const STOCKFISH_URL = "https://cdn.jsdelivr.net/npm/stockfish.wasm/stockfish.js";

export function useStockfish({ level = 3 } = {}) {
  const engineRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [lastInfo, setLastInfo] = useState(null);

  const send = useCallback((cmd) => {
    if (!engineRef.current) return;
    console.log("%c[SEND ➤]", "color:#0af", cmd);
    engineRef.current.postMessage(cmd);
  }, []);

  useEffect(() => {
    const bootstrap = `
      try {
        importScripts("${STOCKFISH_URL}");
        if (typeof STOCKFISH === "function") {
          const sf = STOCKFISH();
          sf.onmessage = (e) => postMessage(e.data);
          onmessage = (e) => sf.postMessage(e.data);
          postMessage("engine:loaded");
        } else {
          postMessage("engine:error:not_a_function");
        }
      } catch (e) {
        postMessage("engine:error:" + e.message);
      }
    `;
    const blob = new Blob([bootstrap], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);
    engineRef.current = worker;

    const handleMessage = (e) => {
      const line = String(e.data || "");
      console.log("%c[ENGINE ➤]", "color:#6f6", line);

      if (line.startsWith("engine:loaded")) {
        send("uci");
      } else if (line.startsWith("engine:error")) {
        console.error("[ENGINE ERROR]", line);
      } else if (line.includes("uciok")) {
        const p = PRESETS[level] || PRESETS[3];
        send(`setoption name Skill Level value ${p.Skill}`);
        send(`setoption name UCI_Elo value ${p.ELO}`);
        send("isready");
      } else if (line.includes("readyok")) {
        setReady(true);
      } else if (line.startsWith("info")) {
        setLastInfo(line);
      } else if (line.startsWith("bestmove")) {
        setThinking(false);
      }
    };

    worker.addEventListener("message", handleMessage);
    worker.onerror = (err) => console.error("[ENGINE ERROR]", err);

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      engineRef.current = null;
      setReady(false);
      setThinking(false);
    };
  }, [level, send]);

  const go = useCallback(
    (fen) => {
      if (!ready || !engineRef.current) return;
      const p = PRESETS[level] || PRESETS[3];
      setThinking(true);
      send(`position fen ${fen}`);
      send(`go movetime ${p.MoveTime}`);
    },
    [ready, level, send]
  );

  const onceBestMove = useCallback(() => {
    return new Promise((resolve) => {
      const handler = (e) => {
        const line = String(e.data || "");
        if (line.startsWith("bestmove")) {
          const mv = line.split(" ")[1];
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
