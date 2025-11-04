import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { play as playSound } from "../audio/SoundManager";

const GENERIC_OUT_OF_BOOK =
  "Tu es sorti du systeme de Londres, reprenons a partir du plan principal.";

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

function variantMatches(optionVariant, activeVariant) {
  if (!activeVariant) return true;
  if (!optionVariant) return true;
  return optionVariant === activeVariant;
}

function getAllowedOptions(node, activeVariant) {
  if (!node) return [];
  return node.options.filter((option) => variantMatches(option.variantTag, activeVariant));
}

function pickIdeaForNode(node, activeVariant) {
  const allowed = getAllowedOptions(node, activeVariant);
  const withIdea = allowed.find((option) => option.idea);
  if (withIdea?.idea) {
    return withIdea.idea;
  }
  if (node?.defaultIdea) {
    return node.defaultIdea;
  }
  const anyWithIdea = node?.options?.find((option) => option.idea);
  return anyWithIdea?.idea ?? null;
}

function findMatchingOption(node, san, activeVariant) {
  if (!node) return null;
  const candidates = node.movesBySan.get(san);
  if (!candidates || !candidates.length) return null;
  for (const option of candidates) {
    if (variantMatches(option.variantTag, activeVariant)) {
      return option;
    }
  }
  return null;
}

function preprocessSemiScript(script) {
  const processed = {
    nodes: new Map(),
    fallbackMessage: script?.outOfBookMessage ?? GENERIC_OUT_OF_BOOK,
    totalPlayerMoves: 0,
  };

  if (!script) {
    return processed;
  }

  const lines = Array.isArray(script.lines)
    ? script.lines
    : Array.isArray(script.referenceLine)
      ? [{ moves: script.referenceLine }]
      : [];

  lines.forEach((rawLine, lineIndex) => {
    const moves = Array.isArray(rawLine?.moves) ? rawLine.moves : [];
    if (!moves.length) return;
    const chess = new Chess();
    let currentVariantTag = rawLine.variantTag ?? null;

    for (let idx = 0; idx < moves.length; idx += 1) {
      const entry = moves[idx];
      if (!entry?.san) {
        continue;
      }
      const actor = entry.actor ?? "player";

      if (actor !== "player") {
        const appliedOpponent = chess.move(entry.san, { sloppy: true });
        if (!appliedOpponent) {
          console.warn(
            `Semi-guided: impossible de rejouer ${entry.san} (actor ${actor}) dans le script ${script?.id} ligne ${lineIndex + 1}`
          );
          chess.undo();
        }
        continue;
      }

      const fenBefore = chess.fen();
      const appliedPlayer = chess.move(entry.san, { sloppy: true });
      if (!appliedPlayer) {
        console.warn(
          `Semi-guided: coup joueur invalide ${entry.san} dans le script ${script?.id} ligne ${lineIndex + 1}`
        );
        continue;
      }

      processed.totalPlayerMoves += 1;

      const optionVariant = entry.variantTag ?? currentVariantTag ?? null;
      if (entry.variantTag) {
        currentVariantTag = entry.variantTag;
      }

      const option = {
        san: appliedPlayer.san,
        idea: entry.idea ?? entry.plan ?? null,
        hints: [
          entry.hint1 ?? (Array.isArray(entry.hints) ? entry.hints[0] : null),
          entry.hint2 ?? (Array.isArray(entry.hints) ? entry.hints[1] : null),
        ].filter(Boolean),
        explain:
          entry.explain ??
          entry.mistake ??
          "Non, ici tu devrais suivre le plan annonce.",
        success:
          entry.success ??
          entry.successMessage ??
          (entry.idea ? `Parfait, ${entry.idea.toLowerCase()}` : null),
        variantTag: optionVariant,
        opponentLine: [],
      };

      while (idx + 1 < moves.length) {
        const nextEntry = moves[idx + 1];
        const nextActor = nextEntry?.actor ?? "player";
        if (nextActor !== "opponent") {
          break;
        }
        idx += 1;
        const appliedOpponent = chess.move(nextEntry.san, { sloppy: true });
        if (!appliedOpponent) {
          console.warn(
            `Semi-guided: coup adversaire invalide ${nextEntry.san} apres ${entry.san} dans le script ${script?.id}`
          );
          chess.undo();
          continue;
        }
        option.opponentLine.push({ san: appliedOpponent.san });
      }

      option.nextFen = chess.fen();

      let node = processed.nodes.get(fenBefore);
      if (!node) {
        node = {
          options: [],
          movesBySan: new Map(),
          defaultIdea: option.idea ?? null,
        };
        processed.nodes.set(fenBefore, node);
      } else if (!node.defaultIdea && option.idea) {
        node.defaultIdea = option.idea;
      }

      node.options.push(option);
      const existing = node.movesBySan.get(option.san) ?? [];
      existing.push(option);
      node.movesBySan.set(option.san, existing);
    }
  });

  return processed;
}

export default function useSemiGuidedTrainingGame({
  script,
  playerSide = "white",
  elo = 1200,
  active = false,
}) {
  const treeRef = useRef(preprocessSemiScript(null));
  const gameRef = useRef(new Chess());
  const activeVariantRef = useRef(null);
  const pendingRevealRef = useRef(null);
  const mistakeCounterRef = useRef(new Map());

  const [position, setPosition] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coachMessageState, setCoachMessageState] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [analysis, setAnalysis] = useState({ loading: false, bestMove: null, score: null });
  const [waitingOpponent] = useState(false);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);

  const lastCoachMessageRef = useRef(null);

  const updateCoachMessage = useCallback((message, options = {}) => {
    const persist = options.persist ?? true;
    if (message) {
      lastCoachMessageRef.current = message;
    } else if (!persist) {
      lastCoachMessageRef.current = null;
    }
    setCoachMessageState(message);
  }, []);

  const syncBoardState = useCallback(() => {
    const fen = gameRef.current.fen();
    const verboseHistory = gameRef.current.history({ verbose: true });
    setPosition(fen);
    setHistory(verboseHistory);
    setCurrentIndex(verboseHistory.length);
  }, []);

  const preparePlayerTurn = useCallback(() => {
    const fen = gameRef.current.fen();
    const { nodes, fallbackMessage } = treeRef.current;
    const node = nodes.get(fen) ?? null;
    setAnalysis({ loading: false, bestMove: null, score: null });

    if (!node) {
      updateCoachMessage({
        type: "plan",
        title: "Hors scenario",
        detail: fallbackMessage,
      });
      setSequenceCompleted(false);
      return;
    }

    if (!node.options.length) {
      updateCoachMessage({
        type: "plan",
        title: "Sequence completee",
        detail: "Tu as termine cette sequence, bravo !",
      });
      setSequenceCompleted(true);
      return;
    }

    const idea = pickIdeaForNode(node, activeVariantRef.current);
    updateCoachMessage({
      type: "plan",
      title: "Plan suggere",
      detail: idea ?? "Identifie le coup cle de cette position.",
    });
    setSequenceCompleted(false);
  }, [updateCoachMessage]);

  const advanceScenario = useCallback(
    (option, playerMove) => {
      if (option.variantTag) {
        activeVariantRef.current = option.variantTag;
      }
      triggerSound(playerMove);
      option.opponentLine.forEach((step) => {
        const applied = gameRef.current.move(step.san, { sloppy: true });
        if (applied) {
          triggerSound(applied);
        }
      });
      pendingRevealRef.current = null;
      syncBoardState();
      const nextNode = treeRef.current.nodes.get(gameRef.current.fen());
      setSequenceCompleted(!nextNode || nextNode.options.length === 0);
      setAnalysis({ loading: false, bestMove: null, score: null });
      preparePlayerTurn();
    },
    [preparePlayerTurn, syncBoardState]
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

      const node = treeRef.current.nodes.get(previousFen);
      const matchedOption = findMatchingOption(node, move.san, activeVariantRef.current);

      if (!matchedOption) {
        gameRef.current.undo();
        syncBoardState();

        const errorCount = (mistakeCounterRef.current.get(previousFen) ?? 0) + 1;
        mistakeCounterRef.current.set(previousFen, errorCount);

        const allowedOptions = getAllowedOptions(node, activeVariantRef.current);
        const primaryOption = allowedOptions[0] ?? null;
        const hints = primaryOption?.hints ?? [];
        const hint = hints.length ? hints[Math.min(errorCount - 1, hints.length - 1)] : null;

        pendingRevealRef.current = primaryOption
          ? { fen: previousFen, san: primaryOption.san, idea: primaryOption.idea }
          : null;

        setFeedback({
          type: "error",
          evaluation: "mistake",
          title: errorCount === 1 ? "Coup incorrect" : "Toujours pas le bon coup",
          detail: primaryOption?.explain ?? treeRef.current.fallbackMessage,
          hint,
          canRetry: true,
          canReveal: Boolean(pendingRevealRef.current && errorCount >= 2),
          expectedSan: pendingRevealRef.current?.san ?? null,
        });
        preparePlayerTurn();
        return false;
      }

      mistakeCounterRef.current.delete(previousFen);
      advanceScenario(matchedOption, move);
      setFeedback({
        type: "success",
        evaluation: "good",
        title: "Coup correct",
        detail: matchedOption.success ?? matchedOption.idea ?? "Tu restes dans le plan du Londres.",
      });
      return true;
    },
    [active, advanceScenario, preparePlayerTurn, playerSide, waitingOpponent, syncBoardState]
  );

  const retryLastMove = useCallback(() => {
    setFeedback(null);
    preparePlayerTurn();
  }, [preparePlayerTurn]);

  const revealBestMove = useCallback(() => {
    const pending = pendingRevealRef.current;
    if (!pending) return false;
    if (gameRef.current.fen() !== pending.fen) return false;

    const node = treeRef.current.nodes.get(pending.fen);
    const option = findMatchingOption(node, pending.san, activeVariantRef.current);
    if (!option) return false;

    const move = gameRef.current.move(pending.san, { sloppy: true });
    if (!move) {
      return false;
    }

    mistakeCounterRef.current.delete(pending.fen);
    advanceScenario(option, move);
    setFeedback({
      type: "info",
      evaluation: "reveal",
      title: `Coup conseille : ${pending.san}`,
      detail: pending.idea ? `Retiens : ${pending.idea}` : "Voici la suite a memoriser.",
    });
    return true;
  }, [advanceScenario]);

  const resetSequence = useCallback(
    ({ resume = true } = {}) => {
      gameRef.current = new Chess();
      activeVariantRef.current = null;
      pendingRevealRef.current = null;
      mistakeCounterRef.current = new Map();
      setSequenceCompleted(false);
      setFeedback(null);
      setAnalysis({ loading: false, bestMove: null, score: null });
      updateCoachMessage(null, { persist: false });
      syncBoardState();
      if (resume && active) {
        preparePlayerTurn();
      }
    },
    [active, preparePlayerTurn, syncBoardState, updateCoachMessage]
  );

  useEffect(() => {
    const processed = preprocessSemiScript(script);
    treeRef.current = processed;
    resetSequence({ resume: active });
  }, [script, resetSequence, active]);

  const playerMovesCount = treeRef.current.totalPlayerMoves;

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
    expectedMove: null,
    completed: sequenceCompleted,
    resetSequence,
    waitingOpponent: active ? waitingOpponent : false,
    arePiecesDraggable: active,
    opponentProfile: { elo },
    handleDrop,
    retryLastMove,
    revealBestMove,
  };
}
