const PIECE_VALUE = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function depthByElo(elo) {
  if (elo < 800) return 1;
  if (elo < 1200) return 2;
  if (elo < 1600) return 3;
  if (elo < 2000) return 4;
  return 5 + Math.floor((elo - 2000) / 400);
}

function noiseByElo(elo) {
  if (elo < 1600) return 0.3;
  return 0;
}

// This is now only for high-elo inaccuracies
function mistakesByElo(elo) {
  if (elo < 1600) {
    return { positional: 0.15 };
  }
  return { positional: 0.05 };
}

function delayForMove(depth, isTactical) {
  const base = 500;
  const max = 3000;
  const complexityFactor = Math.min(depth / 8, 1);
  const tacticalBonus = isTactical ? 600 : 0;
  const randomJitter = Math.random() * 400;
  return base + complexityFactor * (max - base) + tacticalBonus + randomJitter;
}

function setMultiPV(stockfish, value) {
  stockfish.postMessage(`setoption name MultiPV value ${value}`);
}

function parseInfoLine(line) {
  const depthMatch = line.match(/depth (\d+)/);
  const multiMatch = line.match(/multipv (\d+)/);
  const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
  const pvIndex = line.indexOf(" pv ");
  if (!depthMatch || !multiMatch || !scoreMatch || pvIndex === -1) return null;
  const moveSeq = line.substring(pvIndex + 4).trim().split(" ");
  if (!moveSeq.length) return null;
  let score = Number(scoreMatch[2]);
  if (scoreMatch[1] === "mate") {
    const sign = score > 0 ? 1 : -1;
    score = sign * 100000;
  }
  return {
    depth: Number(depthMatch[1]),
    multipv: Number(multiMatch[1]),
    score,
    uci: moveSeq[0],
  };
}

function annotateCandidate(candidate, game) {
  const moveData = {
    from: candidate.uci.slice(0, 2),
    to: candidate.uci.slice(2, 4),
    promotion: candidate.uci.slice(4) || undefined,
    san: "",
    isCapture: false,
    isCheck: false,
    score: candidate.score,
    multipv: candidate.multipv,
  };
  const verboseMoves = game.moves({ verbose: true });
  const match = verboseMoves.find(
    (mv) =>
      mv.from === moveData.from &&
      mv.to === moveData.to &&
      (moveData.promotion ? mv.promotion === moveData.promotion : true)
  );
  if (match) {
    moveData.isCapture = Boolean(match.captured);
    moveData.piece = match.piece;
    moveData.captured = match.captured;
  }
  const played = game.move({
    from: moveData.from,
    to: moveData.to,
    promotion: moveData.promotion,
  });
  if (played) {
    moveData.san = played.san;
    moveData.isCheck = played.san.includes("+") || played.san.includes("#");
    game.undo();
  }
  if (!moveData.san) {
    moveData.san = moveData.uci;
  }
  if (moveData.isCapture && moveData.captured && moveData.piece) {
    const gain =
      (PIECE_VALUE[moveData.captured] || 0) -
      (PIECE_VALUE[moveData.piece] || 0);
    moveData.winningCapture = gain >= 1;
  } else {
    moveData.winningCapture = false;
  }
  return moveData;
}

function pickWeightedRandom(items, weightFunc) {
  if (!items || items.length === 0) {
    return null;
  }
  const weightedItems = items.map((item, index) => ({
    item,
    weight: weightFunc(item, index, items.length),
  }));

  const totalWeight = weightedItems.reduce((sum, current) => sum + current.weight, 0);
  let random = Math.random() * totalWeight;

  for (const weightedItem of weightedItems) {
    random -= weightedItem.weight;
    if (random <= 0) {
      return weightedItem.item;
    }
  }
  return weightedItems[weightedItems.length - 1].item;
}

function pickCandidate(candidates, elo) {
  // For high ELO, use a logic of adding noise and picking the best.
  // This simulates a strong player who makes small inaccuracies.
  if (elo > 1200) {
    const noise = noiseByElo(elo);
    const mistakes = mistakesByElo(elo);
    const adjusted = candidates.map((cand) => {
      const jitter = (Math.random() * 2 - 1) * noise * 100;
      return { ...cand, adjustedScore: cand.score + jitter };
    });
    adjusted.sort((a, b) => b.adjustedScore - a.adjustedScore);

    let chosen = adjusted[0];

    // Small chance of picking the second best move
    if (Math.random() < mistakes.positional && adjusted[1]) {
      chosen = adjusted[1];
    }
    return chosen || candidates[0];
  }

  // For low ELO (<1200), use a weighted random selection.
  // This simulates a player who doesn't know what the best move is.

  // The 'temperature' controls how random the choice is.
  // Low temp = more random (flatter weights). High temp = more deterministic (steeper weights).
  const temperature = (elo - 400) / 800; // Ranges from 0 (400 ELO) to 1 (1200 ELO)

  const chosen = pickWeightedRandom(candidates, (candidate, index, total) => {
    // We use an exponential decay function for the weights.
    // The base of the exponent is determined by the temperature.
    // A lower ELO (lower temp) results in a slower decay, making bad moves more likely.
    const base = 1 + temperature * 4; // base ranges from 1 to 5
    const weight = Math.pow(base, total - index - 1);
    return weight;
  });

  console.log(`!!! LOW ELO PICK (ELO ${elo}): Choosing ${chosen.san}`);
  return chosen;
}

function listenOnce(stockfish, handler) {
  const listener = (event) => {
    handler(event);
  };
  stockfish.addEventListener("message", listener);
  return () => stockfish.removeEventListener("message", listener);
}

function analysePosition(stockfish, fen, depth, multiPV = 3) {
  return new Promise((resolve, reject) => {
    const results = {};
    const cleanup = listenOnce(stockfish, (event) => {
      const line = event.data;
      if (typeof line !== "string") return;
      if (line.startsWith("info")) {
        const info = parseInfoLine(line);
        if (info) {
          results[info.multipv] = info;
        }
      } else if (line.startsWith("bestmove")) {
        cleanup();
        const list = Object.values(results)
          .sort((a, b) => a.multipv - b.multipv)
          .slice(0, multiPV);
        resolve(list);
      }
    });

    stockfish.postMessage("stop");
    stockfish.postMessage(`position fen ${fen}`);
    stockfish.postMessage(`go depth ${depth}`);
    setTimeout(() => {
      cleanup();
      reject(new Error("Stockfish timeout"));
    }, 10000);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Humanised Stockfish move suggestion.
 * @param {Worker} stockfish
 * @param {Chess} game
 * @param {number} eloLevel
 * @returns {Promise<{from:string,to:string,san:string,promotion?:string}>}
 */
export async function getHumanizedMove(stockfish, game, eloLevel = 1200) {
  const depth = depthByElo(eloLevel);
  
  let multiPV = 3;
  if (eloLevel < 1600) multiPV = 5;
  if (eloLevel < 1000) multiPV = 7;

  setMultiPV(stockfish, multiPV);
  const fen = game.fen();
  let candidates = await analysePosition(stockfish, fen, depth, multiPV);
  if (!candidates.length) {
    throw new Error("Aucun coup retourné par Stockfish");
  }
  candidates = candidates.map((cand) => annotateCandidate(cand, game));
  
  // Sort candidates by score (best first) before picking
  candidates.sort((a, b) => b.score - a.score);

  const chosen = pickCandidate(candidates, eloLevel);
  await delay(delayForMove(depth, chosen?.isCapture || chosen?.isCheck));
  console.log(
    `IA (ELO ${eloLevel}) choisit coup: ${chosen?.san} ` +
      `avec évaluation ${chosen?.score} à depth ${depth}`
  );
  return {
    from: chosen.from,
    to: chosen.to,
    san: chosen.san,
    promotion: chosen.promotion,
  };
}

export default getHumanizedMove;
