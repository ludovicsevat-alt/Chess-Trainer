import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { play as playSound } from "../audio/SoundManager";
import {
  createStockfishWorker,
  ensureReady as ensureStockfishReady,
} from "../engine/stockfishWorker";

function triggerSound(move) {
  if (!move) return;
  if (move.san.includes("#")) {
    playSound("checkmate");
    return;
  }
  if (move.san.includes("+")) {
    playSound("check");
    return;
  }
  if (move.captured) {
    playSound("capture");
    return;
  }
  if (move.flags?.includes("k") || move.flags?.includes("q")) {
    playSound("castle");
    return;
  }
  playSound("move");
}

function computeCapturedInfo(history) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const captured = { w: [], b: [] };
  let whiteScore = 0;
  let blackScore = 0;

  history.forEach((move) => {
    if (!move?.captured) return;
    captured[move.color].push(move.captured);
    if (move.color === "w") {
      whiteScore += values[move.captured] ?? 0;
    } else {
      blackScore += values[move.captured] ?? 0;
    }
  });

  return {
    capturedPieces: captured,
    materialAdvantage: whiteScore - blackScore,
  };
}

function computeThinkDelay(eloLevel) {
  const minDelay = 200;
  const maxDelay = 1800;
  const clamped = Math.max(400, Math.min(3200, eloLevel));
  const ratio = (clamped - 400) / (3200 - 400);
  return Math.round(minDelay + ratio * (maxDelay - minDelay));
}

function preprocessScript(script) {
  if (!script?.sequence?.length) return [];
  const parser = new Chess();
  const result = [];

  script.sequence.forEach((item, index) => {
    const parsed = parser.move(item.san, { sloppy: true });
    if (!parsed) {
      console.warn(
        `Coup invalide dans le script ${script.id} a l'index ${index}:`,
        item.san
      );
      parser.undo();
      return;
    }
    result.push({
      index,
      san: parsed.san,
      color: parsed.color,
      from: parsed.from,
      to: parsed.to,
      uci: `${parsed.from}${parsed.to}${parsed.promotion ?? ""}`,
      coach: item.coach ?? null,
      tags: Array.isArray(item.tags) ? item.tags : [],
    });
  });

  return result;
}

function advanceOpponentMoves(game, scriptMoves, playerColor, startIndex) {
  let nextIndex = startIndex;
  for (; nextIndex < scriptMoves.length; nextIndex += 1) {
    const entry = scriptMoves[nextIndex];
    if (entry.color === playerColor) break;
    const played = game.move(entry.san, { sloppy: true });
    if (!played) {
      console.warn("Impossible de rejouer le coup adverse", entry);
      break;
    }
    triggerSound(played);
  }
  return nextIndex;
}

export default function useGuidedTrainingGame({
  script,
  playerSide = "white",
  elo = 1200,
  active = false,
}) {
  const engineControlRef = useRef(null);
  const analysisCleanupRef = useRef(null);
  const pendingAnalysisRef = useRef(null);
  const opponentTimerRef = useRef(null);
  const analysisReadyRef = useRef(Promise.resolve());
  const gameRef = useRef(new Chess());

  const [scriptMoves, setScriptMoves] = useState([]);
  const [position, setPosition] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coachMessage, setCoachMessage] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [analysis, setAnalysis] = useState({ loading: false, bestMove: null, score: null });
  const [completed, setCompleted] = useState(false);
  const [waitingOpponent, setWaitingOpponent] = useState(false);
  const scriptMovesRef = useRef([]);

  const syncBoardState = useCallback(() => {
    const fen = gameRef.current.fen();
    setPosition(fen);
    setHistory(gameRef.current.history({ verbose: true }));
  }, []);

  const cancelPendingAnalysis = useCallback(() => {
    if (!engineControlRef.current?.worker || !pendingAnalysisRef.current) return;
    engineControlRef.current.worker.postMessage("stop");
    pendingAnalysisRef.current.resolve?.({ bestMove: null, score: null });
    pendingAnalysisRef.current = null;
  }, []);

  const clearOpponentTimer = useCallback(() => {
    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
      opponentTimerRef.current = null;
    }
  }, []);

  const expectedMove = useMemo(
    () => scriptMoves[currentIndex] ?? null,
    [scriptMoves, currentIndex]
  );

  const playerColor = playerSide === "white" ? "w" : "b";

  const playerMovesCount = useMemo(
    () => scriptMoves.filter((entry) => entry.color === playerColor).length,
    [scriptMoves, playerColor]
  );

  const playerMovesDone = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentIndex; i += 1) {
      if (scriptMoves[i]?.color === playerColor) {
        count += 1;
      }
    }
    return count;
  }, [scriptMoves, currentIndex, playerColor]);

  useEffect(() => {
    scriptMovesRef.current = scriptMoves;
  }, [scriptMoves]);

  const handleDrop = useCallback(
    (source, target) => {
      if (source === target) return false;
      if (!active) return false;
      if (!expectedMove || completed) return false;
      if (expectedMove.color !== playerColor) return false;
      if (gameRef.current.turn() !== playerColor) return false;

      const move = gameRef.current.move({
        from: source,
        to: target,
        promotion: "q",
      });

      if (!move) {
        return false;
      }

      if (move.san !== expectedMove.san) {
        gameRef.current.undo();
        const reminderDetail =
          expectedMove.coach ??
          `Le coup attendu est ${expectedMove.san}. Rejoue-le pour suivre la ligne.`;
        setFeedback({
          type: "error",
          title: "Coup incorrect",
          detail: `Tu as joue ${move.san}. ${reminderDetail}`,
        });
        return false;
      }

      triggerSound(move);
      if (expectedMove.coach) {
        setFeedback({
          type: "success",
          title: `Instruction appliquee (${expectedMove.san})`,
          detail: expectedMove.coach,
        });
      } else {
        setFeedback(null);
      }

      clearOpponentTimer();
      setWaitingOpponent(true);
      const executeOpponentMove = () => {
        const nextIndex = advanceOpponentMoves(
          gameRef.current,
          scriptMoves,
          playerColor,
          currentIndex + 1
        );
        setCurrentIndex(nextIndex);
        syncBoardState();
        setWaitingOpponent(false);
        clearOpponentTimer();
      };

      const delay = computeThinkDelay(elo);
      if (delay <= 0) {
        executeOpponentMove();
      } else {
        opponentTimerRef.current = setTimeout(executeOpponentMove, delay);
      }
      return true;
    },
    [
      expectedMove,
      completed,
      playerColor,
      scriptMoves,
      currentIndex,
      syncBoardState,
      clearOpponentTimer,
      elo,
      active,
    ]
  );

  const resetSequence = useCallback(
    ({ resume = true } = {}) => {
      clearOpponentTimer();
      gameRef.current = new Chess();
      setFeedback(null);
      setCompleted(false);
      setWaitingOpponent(false);
      setCoachMessage(null);
      setAnalysis({ loading: false, bestMove: null, score: null });
      let nextIndex = 0;
      const moves = scriptMovesRef.current ?? [];
      if (resume && moves.length) {
        nextIndex = advanceOpponentMoves(gameRef.current, moves, playerColor, 0);
      }
      setCurrentIndex(nextIndex);
      syncBoardState();
    },
    [playerColor, syncBoardState, clearOpponentTimer]
  );

  const ensureAnalysisWorker = useCallback(() => {
    if (engineControlRef.current) return;
    const control = createStockfishWorker({
      multiPV: 1,
      skillLevel: 20,
      limitStrength: false,
    });
    engineControlRef.current = control;
    analysisReadyRef.current = ensureStockfishReady(control);
    const worker = control.worker;

    const handleMessage = (event) => {
      const state = pendingAnalysisRef.current;
      if (!state) return;
      const line = event.data;
      if (typeof line !== "string") return;

      if (line.startsWith("info depth")) {
        const match = line.match(/score (cp|mate) (-?\d+)/);
        if (match) {
          const type = match[1];
          const raw = Number.parseInt(match[2], 10);
          if (Number.isNaN(raw)) return;
          state.score = type === "mate" ? (raw > 0 ? 1000 : -1000) : raw / 100;
        }
      }

      if (line.startsWith("bestmove")) {
        const tokens = line.split(" ");
        const best = tokens[1];
        const result = {
          bestMove: best === "(none)" ? null : best,
          score: state.score ?? null,
        };
        pendingAnalysisRef.current = null;
        state.resolve(result);
      }
    };

    const handleError = (event) => {
      console.error("Stockfish analysis worker error:", event?.message ?? event);
      if (pendingAnalysisRef.current) {
        pendingAnalysisRef.current.resolve?.({ bestMove: null, score: null });
        pendingAnalysisRef.current = null;
      }
      analysisCleanupRef.current?.();
      analysisCleanupRef.current = null;
      control.terminate();
      engineControlRef.current = null;
      analysisReadyRef.current = Promise.resolve();
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);
    analysisCleanupRef.current = () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
    };
  }, []);

  const teardownAnalysisWorker = useCallback(() => {
    cancelPendingAnalysis();
    analysisCleanupRef.current?.();
    analysisCleanupRef.current = null;
    engineControlRef.current?.terminate();
    engineControlRef.current = null;
    analysisReadyRef.current = Promise.resolve();
  }, [cancelPendingAnalysis]);

  const requestAnalysis = useCallback(
    (fen) =>
      new Promise((resolve) => {
        const launch = async () => {
          ensureAnalysisWorker();
          if (!active) {
            resolve({ bestMove: null, score: null });
            return;
          }
          await analysisReadyRef.current;
          if (!active || !engineControlRef.current?.worker) {
            resolve({ bestMove: null, score: null });
            return;
          }
          cancelPendingAnalysis();
          pendingAnalysisRef.current = { resolve, reject: null, score: null };
          engineControlRef.current.worker.postMessage(`position fen ${fen}`);
          engineControlRef.current.worker.postMessage("go depth 18");
          setTimeout(() => {
            if (!pendingAnalysisRef.current) return;
            pendingAnalysisRef.current = null;
            resolve({ bestMove: null, score: null });
          }, 10000);
        };
        launch();
      }),
    [cancelPendingAnalysis, active, ensureAnalysisWorker]
  );

  useEffect(() => {
    if (active) {
      ensureAnalysisWorker();
      return undefined;
    }
    teardownAnalysisWorker();
    return undefined;
  }, [active, ensureAnalysisWorker, teardownAnalysisWorker]);

  useEffect(
    () => () => {
      teardownAnalysisWorker();
    },
    [teardownAnalysisWorker]
  );

  useEffect(() => {
    setAnalysis({ loading: false, bestMove: null, score: null });
    setFeedback(null);
    setCoachMessage(null);
    setCompleted(false);
    const processed = preprocessScript(script);
    scriptMovesRef.current = processed;
    setScriptMoves(processed);
    resetSequence({ resume: active && processed.length > 0 });
  }, [script, active, resetSequence]);

  useEffect(() => {
    if (!active) return;
    ensureAnalysisWorker();
    if (!scriptMoves.length) return;
    const move = expectedMove;
    if (!move) {
      setCompleted(true);
      setCoachMessage({
        type: "completed",
        title: "Sequence terminee",
        detail:
          "Vous avez rejoue toute la ligne guidee. Passez en mode semi-guide pour tester vos idees.",
      });
      setAnalysis({ loading: false, bestMove: null, score: null });
      return;
    }

    const fen = gameRef.current.fen();
    const instructionDetail =
      move.coach ??
      `Joue ${move.san} pour poursuivre le plan de la lecon.`;
    setCoachMessage({
      type: "instruction",
      title: `Joue ${move.san}`,
      detail: instructionDetail,
      san: move.san,
      tags: move.tags ?? [],
    });
    setAnalysis((prev) => ({ ...prev, loading: true }));

    let cancelled = false;
    requestAnalysis(fen).then((info) => {
      if (cancelled || !info) return;
      if (!info.bestMove) {
        setAnalysis({ loading: false, bestMove: null, score: info.score ?? null });
        return;
      }
      const tmp = new Chess(fen);
      const best = tmp.move({
        from: info.bestMove.slice(0, 2),
        to: info.bestMove.slice(2, 4),
        promotion: info.bestMove.slice(4) || undefined,
      });
      setAnalysis({
        loading: false,
        bestMove: best
          ? {
              san: best.san,
              from: best.from,
              to: best.to,
              uci: info.bestMove,
            }
          : null,
        score: info.score ?? null,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [expectedMove, scriptMoves, requestAnalysis, active, ensureAnalysisWorker]);

  const sessionState = useMemo(() => {
    const { capturedPieces, materialAdvantage } = computeCapturedInfo(history);
    return {
      position,
      boardOrientation: playerSide === "black" ? "black" : "white",
      history,
      capturedPieces,
      materialAdvantage,
      currentIndex,
      totalMoves: scriptMoves.length,
      playerMovesDone,
      playerMovesCount,
      coachMessage,
      feedback,
      analysis,
      expectedMove,
      completed,
      resetSequence,
      waitingOpponent: active ? waitingOpponent : false,
      arePiecesDraggable:
        active &&
        Boolean(
          expectedMove && expectedMove.color === playerColor && !completed && !waitingOpponent
        ),
      opponentProfile: { elo },
    };
  }, [
    position,
    playerSide,
    history,
    currentIndex,
    scriptMoves,
    playerMovesDone,
    playerMovesCount,
    coachMessage,
    feedback,
    analysis,
    expectedMove,
    completed,
    waitingOpponent,
    active,
    playerColor,
    elo,
    resetSequence,
  ]);

  useEffect(
    () => () => {
      clearOpponentTimer();
    },
    [clearOpponentTimer]
  );

  return {
    ...sessionState,
    handleDrop,
  };
}
