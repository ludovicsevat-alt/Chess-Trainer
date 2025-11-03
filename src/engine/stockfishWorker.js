const ENGINE_PATH = "/engine/stockfish-17.1-lite-single-03e3232.js";

function waitReadyOk(worker) {
  return new Promise((resolve) => {
    const listener = (event) => {
      const line = event.data;
      if (typeof line !== "string") {
        return;
      }
      if (line.startsWith("readyok")) {
        worker.removeEventListener("message", listener);
        resolve();
      }
    };
    worker.addEventListener("message", listener);
    worker.postMessage("isready");
  });
}

function clampElo(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return Math.max(400, Math.min(3200, Math.round(value)));
}

export function createStockfishWorker({
  multiPV = 1,
  skillLevel = 20,
  limitStrength = false,
  initialElo = null,
} = {}) {
  const worker = new Worker(ENGINE_PATH);
  let disposed = false;
  let limitStrengthEnabled = Boolean(limitStrength);
  let desiredElo = limitStrengthEnabled ? clampElo(initialElo) : null;
  let appliedElo = null;

  let resolveReady;
  const readyPromise = new Promise((resolve) => {
    resolveReady = resolve;
  });

  let commandChain = readyPromise;
  const enqueue = (task) => {
    commandChain = commandChain
      .then(() => {
        if (disposed) return;
        return task();
      })
      .catch((error) => {
        if (!disposed) {
          console.warn("[stockfish] commande rejetee :", error);
        }
      });
    return commandChain;
  };

  const postCommands = (commands) => {
    commands
      .filter((cmd) => typeof cmd === "string" && cmd.length > 0)
      .forEach((cmd) => worker.postMessage(cmd));
  };

  const initialiseEngine = () => {
    const commands = [
      multiPV !== null && multiPV !== undefined
        ? `setoption name MultiPV value ${multiPV}`
        : null,
      skillLevel !== null && skillLevel !== undefined
        ? `setoption name Skill Level value ${skillLevel}`
        : null,
      `setoption name UCI_LimitStrength value ${limitStrengthEnabled ? "true" : "false"}`,
    ];
    if (limitStrengthEnabled && desiredElo !== null) {
      commands.push(`setoption name UCI_Elo value ${desiredElo}`);
      appliedElo = desiredElo;
    }
    postCommands(commands);
    waitReadyOk(worker).then(() => resolveReady());
  };

  const applyCurrentElo = () =>
    enqueue(async () => {
      if (!limitStrengthEnabled) {
        appliedElo = null;
        return;
      }
      if (desiredElo === null || desiredElo === appliedElo) {
        return;
      }
      postCommands([
        "stop",
        `setoption name UCI_LimitStrength value true`,
        `setoption name UCI_Elo value ${desiredElo}`,
      ]);
      await waitReadyOk(worker);
      appliedElo = desiredElo;
    });

  const setLimitStrength = (limit, elo = null) =>
    enqueue(async () => {
      limitStrengthEnabled = Boolean(limit);
      if (elo !== null) {
        desiredElo = clampElo(elo);
      }
      const commands = [
        "stop",
        `setoption name UCI_LimitStrength value ${limitStrengthEnabled ? "true" : "false"}`,
      ];
      if (limitStrengthEnabled && desiredElo !== null) {
        commands.push(`setoption name UCI_Elo value ${desiredElo}`);
      }
      postCommands(commands);
      await waitReadyOk(worker);
      appliedElo = limitStrengthEnabled ? desiredElo : null;
    });

  const setElo = (elo) => {
    const clamped = clampElo(elo);
    if (clamped === null) {
      return Promise.resolve();
    }
    desiredElo = clamped;
    if (!limitStrengthEnabled) {
      return setLimitStrength(true, clamped);
    }
    return applyCurrentElo();
  };

  const terminate = () => {
    if (disposed) return;
    disposed = true;
    worker.terminate();
  };

  const bootstrapListener = (event) => {
    const line = event.data;
    if (typeof line !== "string") {
      return;
    }
    if (line.startsWith("uciok")) {
      worker.removeEventListener("message", bootstrapListener);
      initialiseEngine();
    }
  };

  worker.addEventListener("message", bootstrapListener);
  worker.postMessage("uci");

  return {
    worker,
    ready: readyPromise,
    setElo,
    setLimitStrength,
    terminate,
  };
}

export function ensureReady(workerControl) {
  return workerControl?.ready ?? Promise.resolve();
}
