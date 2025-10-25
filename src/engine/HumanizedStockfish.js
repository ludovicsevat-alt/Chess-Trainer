const PIECE_VALUE = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function depthByElo(elo) {
  if (elo < 800) return 2;
  if (elo < 1200) return 3;
  if (elo < 1600) return 4;
  if (elo < 2000) return 5;
  return 6 + Math.floor((elo - 2000) / 400);
}

function noiseByElo(elo) {
  if (elo < 800) return 0.3;
  if (elo < 1200) return 0.2;
  if (elo < 1600) return 0.1;
  return 0;
}

function mistakesByElo(elo) {
  return {
    winningCapture: elo < 2000 ? 0.25 : 0.1,
    ignoreThreat: elo < 1600 ? 0.15 : 0.05,
    positional: elo < 1200 ? 0.25 : 0.12,
  };
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

function pickCandidate(candidates, elo) {
  const noise = noiseByElo(elo);
  const mistakes = mistakesByElo(elo);
  const adjusted = candidates.map((cand) => {
    const jitter = (Math.random() * 2 - 1) * noise * 100;
    return { ...cand, adjustedScore: cand.score + jitter };
  });
  adjusted.sort((a, b) => b.adjustedScore - a.adjustedScore);

  let chosen = adjusted[0];

  if (chosen?.winningCapture && Math.random() < mistakes.winningCapture) {
    chosen = adjusted[1] || chosen;
  }

  if (chosen && chosen.isCheck && Math.random() < mistakes.ignoreThreat) {
    chosen = adjusted[1] || chosen;
  }

  if (Math.random() < mistakes.positional && adjusted[1]) {
    const idx = Math.random() < 0.5 ? 1 : 2;
    chosen = adjusted[idx] || chosen;
  }

  return chosen || candidates[0];
}

function listenOnce(stockfish, handler) {
  const listener = (event) => {
    handler(event);
  };
  stockfish.addEventListener("message", listener);
  return () => stockfish.removeEventListener("message", listener);
}

function analysePosition(stockfish, fen, depth) {
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
          .slice(0, 3);
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
  setMultiPV(stockfish, 3);
  const fen = game.fen();
  let candidates = await analysePosition(stockfish, fen, depth);
  if (!candidates.length) {
    throw new Error("Aucun coup retourné par Stockfish");
  }
  candidates = candidates.map((cand) => annotateCandidate(cand, game));
  const chosen = pickCandidate(candidates, eloLevel);
  await delay(delayForMove(depth, chosen?.isCapture || chosen?.isCheck));
  console.log(
    `IA (ELO ${eloLevel}) choisit coup: ${chosen?.san} ` +
      `avec évaluation bruitée ${chosen?.adjustedScore?.toFixed?.(2) ?? ""} à depth ${depth}`
  );
  return {
    from: chosen.from,
    to: chosen.to,
    san: chosen.san,
    promotion: chosen.promotion,
  };
}

export default getHumanizedMove;
