const oppositeColor = (color) => (color === "white" ? "black" : "white");

const buildDrawReason = (game) => {
  if (game.isStalemate()) return "stalemate";
  if (game.isThreefoldRepetition()) return "repetition";
  if (game.isInsufficientMaterial()) return "insufficient_material";
  if (game.isDraw()) return "draw";
  return "unknown";
};

export const buildResultFromGame = (game) => {
  if (!game?.isGameOver?.()) return null;

  if (game.isCheckmate()) {
    const winner = game.turn() === "w" ? "black" : "white";
    return {
      winner,
      loser: oppositeColor(winner),
      outcome: winner,
      reason: "checkmate",
    };
  }

  return {
    winner: null,
    loser: null,
    outcome: "draw",
    reason: buildDrawReason(game),
  };
};

export const buildResignResult = (winner, reason = "resign") => {
  if (!winner) {
    return {
      winner: null,
      loser: null,
      outcome: "draw",
      reason,
    };
  }
  return {
    winner,
    loser: oppositeColor(winner),
    outcome: winner,
    reason,
  };
};

export { oppositeColor };
