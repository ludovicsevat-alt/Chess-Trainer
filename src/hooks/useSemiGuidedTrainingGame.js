import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { play as playSound } from "../audio/SoundManager";
import getHumanizedMove from "../engine/HumanizedStockfish";
import {
  createStockfishWorker,
  ensureReady as ensureStockfishReady,
} from "../engine/stockfishWorker";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function triggerSound(move) {
  if (!move) return;
  if (move.san?.includes("#")) {
    playSound("checkmate");
    return;
  }
  if (move.san?.includes("+")) {
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

function computeThinkDelay(elo) {
  if (elo <= 800) return 200;
  if (elo <= 1400) return 320;
  if (elo <= 2000) return 480;
  return 620;
}

function getScoreThresholds(elo) {
  if (elo <= 1000) return { good: 1.3, inaccurate: 2.6 };
  if (elo <= 1600) return { good: 0.9, inaccurate: 1.8 };
  if (elo <= 2200) return { good: 0.55, inaccurate: 1.25 };
  return { good: 0.35, inaccurate: 0.85 };
}

function buildSuccessDetail(step, elo) {
  if (step?.success) return step.success;
  if (elo <= 1200) return "Bien joue ! Tu restes dans le plan de base du Londres.";
  if (elo <= 1800) return "Solide : la structure londonienne reste saine.";
  return "Precise execution : tu respectes les themes strategiques du Londres.";
}

function buildInaccurateDetail(step, elo, cpLoss) {
  if (step?.inaccurate) return step.inaccurate;
  if (elo <= 1200) {
    return "Le coup est jouable, mais tu peux viser un placement plus efficace.";
  }
  if (elo <= 1800) {
    return cpLoss !== null
      ? `Tu laisses environ ${cpLoss} cp. Cherche une meilleure coordination.`
      : "Ce coup manque un peu de precision pour conserver la pression.";
  }
  return cpLoss !== null
    ? `L'evaluation baisse d'environ ${cpLoss} cp. Identifie le theme critique.`
    : "Ce coup n'exploite pas pleinement les motifs strategiques du Londres.";
}

function buildMistakeDetail(step, elo, cpLoss) {
  if (step?.mistake) return step.mistake;
  if (elo <= 1200) {
    return "Ce coup sort du schema londonien. Reviens au plan de base.";
  }
  if (elo <= 1800) {
    return cpLoss !== null
      ? `Tu abandonnes environ ${cpLoss} cp. Reprends le plan typique.`
      : "Ce coup donne trop de latitude a l'adversaire.";
  }
  return cpLoss !== null
    ? `Perte d'environ ${cpLoss} cp : reviens vers les themes structuraux du Londres.`
    : "Ce coup rompt avec les principes strategiques du Londres.";
}

function toKey(fen) {
  return fen;
}

function preprocessSemiScript(script) {
  if (!script) {
    return new Map();
  }
  const chess = new Chess();
  const steps = new Map();
  const line = Array.isArray(script.referenceLine) ? script.referenceLine : [];

  line.forEach((item) => {
    if (!item?.san) return;
    const actor = item.actor ?? "player";
    if (actor === "player") {
      const fen = chess.fen();
      const expected = Array.isArray(item.expected) && item.expected.length
        ? item.expected
        : [item.san].filter(Boolean);
      steps.set(fen, {
        plan: item.plan ?? null,
        hints: Array.isArray(item.hints) ? item.hints : [],
        success: item.success ?? "Bon coup, le plan reste coherent.",
        mistake: item.mistake ?? "Ce coup ne sert pas le schema du Londres.",
        expected,
      });
    }
    const made = chess.move(item.san, { sloppy: true });
    if (!made) {
      console.warn(
        `Impossible de reproduire le coup ${item.san} (actor ${actor}) dans le script semi-guided ${script?.id}`
      );
      chess.undo();
    }
  });

  return steps;
}

export default function useSemiGuidedTrainingGame({
  script,
  playerSide = "white",
  elo = 1200,
  active = false,
}) {
  const analysisWorkerRef = useRef(null);
  const humanWorkerRef = useRef(null);
  const analysisControlRef = useRef(null);
  const humanControlRef = useRef(null);
  const pendingAnalysisRef = useRef(null);
  const bestInfoRef = useRef({ fen: null, bestMove: null, score: null });
  const stepMapRef = useRef(new Map());
  const hintUsageRef = useRef(new Map());
  const mistakeCounterRef = useRef(new Map());
  const pendingRevealRef = useRef(null);
  const lastCoachMessageRef = useRef(null);
  const gameRef = useRef(new Chess());
  const analysisReadyRef = useRef(Promise.resolve());
  const humanReadyRef = useRef(Promise.resolve());
  const initialEloRef = useRef(elo);
  initialEloRef.current = elo;

  const [position, setPosition] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coachMessageState, setCoachMessageState] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [analysis, setAnalysis] = useState({ loading: false, bestMove: null, score: null });
  const [waitingOpponent, setWaitingOpponent] = useState(false);

  const updateCoachMessage = useCallback(
    (message, options = {}) => {
      const persist = options.persist ?? true;
      if (message) {
        lastCoachMessageRef.current = message;
      } else if (!persist) {
        lastCoachMessageRef.current = null;
      }
      setCoachMessageState(message);
    },
    [setCoachMessageState]
  );

  const syncBoardState = useCallback(() => {
    const fen = gameRef.current.fen();
    const verboseHistory = gameRef.current.history({ verbose: true });
    setPosition(fen);
    setHistory(verboseHistory);
    setCurrentIndex(verboseHistory.length);
  }, []);

  const cancelPendingAnalysis = useCallback(() => {
    if (!analysisWorkerRef.current || !pendingAnalysisRef.current) return;
    analysisWorkerRef.current.postMessage?.("stop");
    pendingAnalysisRef.current.reject?.(new Error("Analyse annulee"));
    pendingAnalysisRef.current = null;
  }, []);

  useEffect(() => {
    const control = createStockfishWorker({
      multiPV: 1,
      skillLevel: 20,
      limitStrength: false,
    });
    analysisControlRef.current = control;
    analysisWorkerRef.current = control.worker;
    analysisReadyRef.current = ensureStockfishReady(control);

    const handleAnalysisMessage = (event) => {
      const state = pendingAnalysisRef.current;
      if (!state) return;
      const line = event.data;
      if (typeof line !== "string") return;
      if (line.startsWith("info depth")) {
        const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
          const type = scoreMatch[1];
          const raw = Number.parseInt(scoreMatch[2], 10);
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

    control.worker.addEventListener("message", handleAnalysisMessage);

    return () => {
      control.worker.removeEventListener("message", handleAnalysisMessage);
      cancelPendingAnalysis();
      control.terminate();
      analysisWorkerRef.current = null;
      analysisControlRef.current = null;
      analysisReadyRef.current = Promise.resolve();
    };
  }, [cancelPendingAnalysis]);

useEffect(() => {
  const control = createStockfishWorker({
    multiPV: 3,
    skillLevel: 20,
    limitStrength: true,
    initialElo: initialEloRef.current,
  });
  humanControlRef.current = control;
  humanWorkerRef.current = control.worker;
  humanReadyRef.current = ensureStockfishReady(control);

  return () => {
    control.terminate();
    if (humanWorkerRef.current === control.worker) {
      humanWorkerRef.current = null;
    }
    humanControlRef.current = null;
    humanReadyRef.current = Promise.resolve();
  };
}, []);

useEffect(() => {
  if (!active) return;
  const control = humanControlRef.current;
  if (!control) return;
  control
    .setElo(elo)
    .catch((error) => console.warn("Impossible d'appliquer l'ELO en semi-guide :", error));
}, [active, elo]);

  const requestAnalysis = useCallback(
    async (fen) => {
      if (!active) {
        return { bestMove: null, score: null };
      }
      await analysisReadyRef.current;
      if (!active) {
        return { bestMove: null, score: null };
      }
      return new Promise((resolve) => {
        if (!analysisWorkerRef.current) {
          resolve({ bestMove: null, score: null });
          return;
        }
        cancelPendingAnalysis();
        pendingAnalysisRef.current = { resolve, reject: null, score: null };
        analysisWorkerRef.current?.postMessage(`position fen ${fen}`);
        analysisWorkerRef.current?.postMessage("go depth 16");
        setTimeout(() => {
          if (!pendingAnalysisRef.current) return;
          pendingAnalysisRef.current = null;
          resolve({ bestMove: null, score: null });
        }, 8000);
      });
    },
    [cancelPendingAnalysis, active]
  );

  const preparePlayerTurn = useCallback(({ forceActive = false, resetFeedback = false } = {}) => {
    const isSessionActive = forceActive || active;
    if (!isSessionActive) {
      updateCoachMessage(null, { persist: false });
      setAnalysis({ loading: false, bestMove: null, score: null });
      if (resetFeedback) {
        setFeedback(null);
      }
      return;
    }
    const fen = gameRef.current.fen();
    const key = toKey(fen);
    pendingRevealRef.current = null;
    if (resetFeedback) {
      setFeedback(null);
    }

    const step = stepMapRef.current.get(key);
    if (step) {
      updateCoachMessage({
        type: "plan",
        title: "Plan suggere",
        detail: step.plan ?? "Identifie le plan principal de la position.",
      });
    } else {
      updateCoachMessage({
        type: "plan",
        title: "Plan generique",
        detail: "Conserve la structure d4-e3-c3 et developpe tes pieces harmonieusement.",
      });
    }

    setAnalysis({ loading: true, bestMove: null, score: null });
    requestAnalysis(fen).then((info) => {
      if (!info) {
        setAnalysis({ loading: false, bestMove: null, score: null });
        bestInfoRef.current = { fen, bestMove: null, score: null };
        return;
      }
      let bestMove = null;
      if (info.bestMove) {
        const tmp = new Chess(fen);
        const applied = tmp.move({
          from: info.bestMove.slice(0, 2),
          to: info.bestMove.slice(2, 4),
          promotion: info.bestMove.slice(4) || undefined,
        });
        if (applied) {
          bestMove = {
            san: applied.san,
            from: applied.from,
            to: applied.to,
            uci: info.bestMove,
          };
        }
      }
      bestInfoRef.current = { fen, bestMove, score: info.score ?? null };
      setAnalysis({ loading: false, bestMove, score: info.score ?? null });
    });
  }, [requestAnalysis, active, updateCoachMessage]);

  const makeHumanMove = useCallback(async () => {
    if (!active) {
      setWaitingOpponent(false);
      return;
    }
    await humanReadyRef.current;
    if (!active) {
      setWaitingOpponent(false);
      return;
    }
    const worker = humanWorkerRef.current;
    if (!worker) {
      preparePlayerTurn();
      return;
    }
    setWaitingOpponent(true);
    try {
      const thinkDelay = computeThinkDelay(elo);
      if (thinkDelay > 0) {
        await delay(thinkDelay);
      }
      if (!active) {
        setWaitingOpponent(false);
        return;
      }
      const moveData = await getHumanizedMove(worker, gameRef.current, elo);
      if (!moveData) return;
      const move = gameRef.current.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion ?? "q",
      });
      if (move) {
        triggerSound(move);
        syncBoardState();
      }
    } catch (error) {
      console.warn("Erreur IA semi-guided", error);
    } finally {
      setWaitingOpponent(false);
      preparePlayerTurn();
    }
  }, [active, elo, preparePlayerTurn, syncBoardState]);

  const applyPlayerMove = useCallback(
    async (move, previousFen) => {
      triggerSound(move);
      syncBoardState();

      const analysisResult = await requestAnalysis(gameRef.current.fen());
      let playedScore = analysisResult?.score ?? null;
      if (playedScore === null) {
        const fallback = await requestAnalysis(previousFen);
        playedScore = fallback?.score ?? null;
      }
      const bestInfo = bestInfoRef.current;
      const bestScore = bestInfo.fen === previousFen ? bestInfo.score : null;
      const thresholds = getScoreThresholds(elo);

      let classification = "good";
      let evaluationGap = 0;
      if (bestScore !== null && playedScore !== null) {
        const sign = playerSide === "white" ? 1 : -1;
        evaluationGap = (bestScore - playedScore) * sign;
        if (evaluationGap >= thresholds.inaccurate) {
          classification = "mistake";
        } else if (evaluationGap >= thresholds.good) {
          classification = "inaccurate";
        } else if (evaluationGap < -0.25) {
          classification = "good";
        }
      }
      const cpLoss = evaluationGap > 0 ? Math.round(evaluationGap * 100) : null;

      const key = toKey(previousFen);
      const step = stepMapRef.current.get(key);

      if (step && step.expected?.includes(move.san)) {
        classification = "good";
      }

      if (classification === "good") {
        mistakeCounterRef.current.delete(key);
        pendingRevealRef.current = null;
        setFeedback({
          type: "success",
          evaluation: "good",
          title: "Coup correct",
          detail: buildSuccessDetail(step, elo),
        });
        hintUsageRef.current.delete(key);
        await makeHumanMove();
        return true;
      }

      if (classification === "inaccurate") {
        const usage = hintUsageRef.current.get(key) ?? 0;
        const hints = step?.hints ?? [];
        const hint = hints.length ? hints[Math.min(usage, hints.length - 1)] : null;
        hintUsageRef.current.set(key, usage + 1);
        mistakeCounterRef.current.delete(key);
        pendingRevealRef.current = null;
        setFeedback({
          type: "warning",
          evaluation: "inaccurate",
          title: "Coup imprecis",
          detail: buildInaccurateDetail(step, elo, cpLoss),
          hint: hint ?? "Cherche une idee qui renforce ta coordination.",
        });
        await makeHumanMove();
        return true;
      }

      // mistake
      gameRef.current.undo();
      setPosition(previousFen);
      const updatedHistory = gameRef.current.history({ verbose: true });
      setHistory(updatedHistory);
      setCurrentIndex(updatedHistory.length);

      const errorCount = (mistakeCounterRef.current.get(key) ?? 0) + 1;
      mistakeCounterRef.current.set(key, errorCount);

      const expectedSan =
        step?.expected?.[0] ??
        bestInfo?.bestMove?.san ??
        null;

      pendingRevealRef.current = expectedSan
        ? {
            fen: previousFen,
            san: expectedSan,
            explanation: step?.success ?? `Le plan continue avec ${expectedSan}.`,
          }
        : null;

      const hints = step?.hints ?? [];
      const hint = hints.length ? hints[Math.min(errorCount - 1, hints.length - 1)] : null;

      setFeedback({
        type: "error",
        evaluation: "mistake",
        title: errorCount === 1 ? "Coup incorrect" : "Toujours pas le bon coup",
        detail: buildMistakeDetail(step, elo, cpLoss),
        hint: hint ?? "Rappelle-toi quelles pieces doivent soutenir le centre.",
        canRetry: true,
        canReveal: Boolean(pendingRevealRef.current && errorCount >= 2),
        expectedSan: pendingRevealRef.current?.san ?? null,
      });
      preparePlayerTurn();
      return false;
    },
    [elo, makeHumanMove, preparePlayerTurn, requestAnalysis, playerSide, syncBoardState]
  );

  const handleDrop = useCallback(
    (source, target) => {
      if (source === target) return false;
      if (!active) return false;
      if (waitingOpponent) return false;
      const playerColor = playerSide === "white" ? "w" : "b";
      if (gameRef.current.turn() !== playerColor) return false;
      const previousFen = gameRef.current.fen();

      const move = gameRef.current.move({
        from: source,
        to: target,
        promotion: "q",
      });

      if (!move) {
        return false;
      }

      applyPlayerMove(move, previousFen);
      return true;
    },
    [applyPlayerMove, waitingOpponent, playerSide, active]
  );

  const retryLastMove = useCallback(() => {
    preparePlayerTurn({ resetFeedback: true });
  }, [preparePlayerTurn]);

  const revealBestMove = useCallback(async () => {
    const pending = pendingRevealRef.current;
    if (!pending) return false;
    const { san, explanation } = pending;
    const move = gameRef.current.move(san, { sloppy: true });
    if (!move) {
      gameRef.current.undo();
      return false;
    }
    triggerSound(move);
    syncBoardState();
    setFeedback({
      type: "info",
      evaluation: "reveal",
      title: `Coup conseille : ${san}`,
      detail: explanation ?? `Le plan continue avec ${san}.`,
    });
    hintUsageRef.current.delete(toKey(gameRef.current.fen()));
    mistakeCounterRef.current.delete(toKey(gameRef.current.fen()));
    pendingRevealRef.current = null;
    await makeHumanMove();
    return true;
  }, [makeHumanMove, syncBoardState]);

  const resetSequence = useCallback(
    ({ resume = true } = {}) => {
      gameRef.current = new Chess();
      const startFen = gameRef.current.fen();
      setPosition(startFen);
      setHistory([]);
      setCurrentIndex(0);
      hintUsageRef.current = new Map();
      mistakeCounterRef.current = new Map();
      pendingRevealRef.current = null;
      bestInfoRef.current = { fen: null, bestMove: null, score: null };
      setFeedback(null);
      setWaitingOpponent(false);
      setAnalysis({ loading: false, bestMove: null, score: null });
      updateCoachMessage(null, { persist: resume });
      if (!resume) {
        return;
      }
      preparePlayerTurn({ forceActive: resume, resetFeedback: true });
      if (playerSide === "black") {
        makeHumanMove();
      }
    },
    [makeHumanMove, preparePlayerTurn, playerSide, updateCoachMessage]
  );

  useEffect(() => {
    const stepMap = preprocessSemiScript(script);
    stepMapRef.current = stepMap;
    resetSequence({ resume: active });
  }, [script, resetSequence, active]);

  const playerMovesCount = stepMapRef.current.size;

  const playerMovesDone = useMemo(() => {
    const targetColor = playerSide === "white" ? "w" : "b";
    return history.filter((move) => move.color === targetColor).length;
  }, [history, playerSide]);

  const { capturedPieces, materialAdvantage } = useMemo(
    () => computeCapturedInfo(history),
    [history]
  );

  const visibleCoachMessage = coachMessageState ?? lastCoachMessageRef.current;

  return {
    position,
    boardOrientation: playerSide === "black" ? "black" : "white",
    history,
    capturedPieces,
    materialAdvantage,
    currentIndex,
    totalMoves: history.length,
    playerMovesDone,
    playerMovesCount,
    coachMessage: visibleCoachMessage,
    feedback,
    analysis,
    expectedMove: bestInfoRef.current.bestMove,
    completed: false,
    resetSequence,
    waitingOpponent: active ? waitingOpponent : false,
    arePiecesDraggable: active && !waitingOpponent,
    opponentProfile: { elo },
    handleDrop,
    retryLastMove,
    revealBestMove,
  };
}

