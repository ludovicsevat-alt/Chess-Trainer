import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { play as playSound } from "../audio/SoundManager";
import { SOCKET_BASE_URL, getSocketClient } from "../services/socketClient.js";
import { buildResignResult, buildResultFromGame } from "../utils/gameResult.js";

const defaultOnlineState = {
  connected: false,
  roomId: null,
  playerId: null,
  players: [],
  status: "idle",
  error: null,
  result: null,
};

const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

const randomId = () => Math.random().toString(36).slice(2, 10);

const computeCaptureInfo = (moves = [], ply = 0) => {
  const capturedPieces = { w: [], b: [] };
  let whiteScore = 0;
  let blackScore = 0;

  for (let i = 0; i < ply; i += 1) {
    const move = moves[i];
    if (!move || typeof move !== "object") continue;
    if (!move.captured) continue;
    const captor = move.color; // "w" ou "b"
    const pieceType = move.captured;
    capturedPieces[captor].push(pieceType);
    const value = PIECE_VALUES[pieceType] ?? 0;
    if (captor === "w") whiteScore += value;
    else blackScore += value;
  }

  return {
    capturedPieces,
    materialAdvantage: whiteScore - blackScore,
  };
};

const triggerSound = (move) => {
  if (!move) return;
  const san = move.san ?? "";
  if (san.includes("#")) {
    playSound("checkmate");
    return;
  }
  if (san.includes("+")) {
    playSound("check");
    return;
  }
  if (move.captured || move.flags?.includes("c") || move.flags?.includes("e")) {
    playSound("capture");
    return;
  }
  playSound("move");
};

const buildStatusMessage = (game) => {
  const turn = game.turn();
  let message = turn === "w" ? "Tour des blancs" : "Tour des noirs";
  let isGameOver = false;

  if (game.isCheckmate()) {
    message =
      turn === "w"
        ? "Les noirs gagnent par échec et mat."
        : "Les blancs gagnent par échec et mat.";
    isGameOver = true;
  } else if (game.isDraw()) {
    message = "Partie nulle.";
    isGameOver = true;
  } else if (game.isCheck()) {
    message += " (échec)";
  }

  return { turn, message, isGameOver };
};

const derivePositions = (moves = []) => {
  const replay = new Chess();
  const list = [replay.fen()];
  moves.forEach((move) => {
    replay.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? "q",
    });
    list.push(replay.fen());
  });
  return list;
};

const normalizeRoom = (room) => {
  if (!room) return {};
  return {
    id: room.id,
    status: room.status,
    players: room.players ?? [],
    result: room.result ?? null,
  };
};

export default function useOnlineGame(
  initialColor = "white",
  { enabled = false } = {}
) {
  const gameRef = useRef(new Chess());
  const socket = useMemo(() => getSocketClient(), []);
  const [onlineState, setOnlineState] = useState(defaultOnlineState);
  const [serverReady, setServerReady] = useState(false);
  const [history, setHistory] = useState([]);
  const [positions, setPositions] = useState([gameRef.current.fen()]);
  const [position, setPosition] = useState(gameRef.current.fen());
  const [currentPly, setCurrentPly] = useState(0);
  const currentPlyRef = useRef(0);
  const [gameStatus, setGameStatus] = useState(
    buildStatusMessage(gameRef.current)
  );
  const [captureInfo, setCaptureInfo] = useState(
    computeCaptureInfo([], 0)
  );
  const [localResult, setLocalResult] = useState(null);
  const [colorPreference, setColorPreference] = useState(initialColor ?? "white");

  useEffect(() => {
    currentPlyRef.current = currentPly;
  }, [currentPly]);

  const resetBoardState = useCallback(() => {
    gameRef.current = new Chess();
    const startFen = gameRef.current.fen();
    setHistory([]);
    setPositions([startFen]);
    setPosition(startFen);
    setCurrentPly(0);
    setGameStatus(buildStatusMessage(gameRef.current));
    setCaptureInfo(computeCaptureInfo([], 0));
    setLocalResult(null);
  }, []);

  const syncFromGame = useCallback(
    ({ forceLatest = false } = {}) => {
      const verbose = gameRef.current.history({ verbose: true });
      const verboseWithPly = verbose.map((move, idx) => ({
        ...move,
        ply: idx + 1,
        id: move.id ?? randomId(),
      }));
      const posList = derivePositions(verboseWithPly);
      const lastIndex = posList.length - 1;
      const targetIndex = forceLatest
        ? lastIndex
        : Math.min(currentPlyRef.current, lastIndex);

      setHistory(verboseWithPly);
      setPositions(posList);
      setCurrentPly(targetIndex);
      setPosition(posList[targetIndex]);
      setGameStatus(buildStatusMessage(gameRef.current));
      setCaptureInfo(computeCaptureInfo(verboseWithPly, targetIndex));
      setLocalResult(buildResultFromGame(gameRef.current));
    },
    []
  );

  const handleLocalMove = useCallback(
    ({ from, to, promotion = "q" }) => {
      const currentGame = gameRef.current;
      const move = currentGame.move({ from, to, promotion });
      if (!move) return null;
      triggerSound(move);
      syncFromGame({ forceLatest: true });
      return move;
    },
    [syncFromGame]
  );

  const handleRemoteMove = useCallback(
    ({ from, to, promotion = "q" }) => {
      const currentGame = gameRef.current;
      const move = currentGame.move({ from, to, promotion });
      if (!move) return;
      triggerSound(move);
      syncFromGame({ forceLatest: true });
    },
    [syncFromGame]
  );

  useEffect(() => {
    if (!enabled) {
      setServerReady(false);
      return undefined;
    }
    let active = true;
    const controller = new AbortController();

    fetch(`${SOCKET_BASE_URL.replace(/^ws/, "http")}/health`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!active) return;
        setServerReady(res.ok);
        setOnlineState((prev) => ({
          ...prev,
          error: res.ok ? null : "Serveur en ligne indisponible.",
        }));
      })
      .catch(() => {
        if (!active) return;
        setServerReady(false);
        setOnlineState((prev) => ({
          ...prev,
          error: "Serveur en ligne indisponible.",
        }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled]);

  useEffect(() => {
    if (!socket || !enabled || !serverReady) {
      socket?.disconnect();
      setOnlineState(defaultOnlineState);
      resetBoardState();
      return undefined;
    }

    socket.connect();

    const handleConnect = () =>
      setOnlineState((prev) => ({ ...prev, connected: true, error: null }));

    const handleDisconnect = () => {
      setOnlineState((prev) => ({
        ...prev,
        connected: false,
        status: "idle",
        result: null,
      }));
      resetBoardState();
    };

    const handleRoomUpdate = ({ room }) => {
      const safeRoom = normalizeRoom(room);
      setOnlineState((prev) => ({
        ...prev,
        roomId: safeRoom.id ?? prev.roomId,
        players: safeRoom.players ?? prev.players,
        status: safeRoom.status ?? prev.status,
        result: safeRoom.result ?? prev.result,
      }));
      if (safeRoom.status !== "ready") {
        resetBoardState();
      }
    };

    const handleError = (message) =>
      setOnlineState((prev) => ({ ...prev, error: message }));

    const handleRemoteMoveEvent = ({ move }) => {
      if (!move) return;
      handleRemoteMove(move);
    };

    const handleGameResigned = ({ playerId }) => {
      setOnlineState((prev) => {
        const loserColor =
          prev.players.find((player) => player.id === playerId)?.color ?? null;
        const winnerColor =
          loserColor === "white"
            ? "black"
            : loserColor === "black"
            ? "white"
            : null;
        return {
          ...prev,
          result: buildResignResult(winnerColor),
          status: "ended",
        };
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room:update", handleRoomUpdate);
    socket.on("room:error", handleError);
    socket.on("move:played", handleRemoteMoveEvent);
    socket.on("game:resigned", handleGameResigned);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room:update", handleRoomUpdate);
      socket.off("room:error", handleError);
      socket.off("move:played", handleRemoteMoveEvent);
      socket.off("game:resigned", handleGameResigned);
      socket.disconnect();
    };
  }, [socket, enabled, serverReady, handleRemoteMove, resetBoardState]);

  useEffect(() => {
    if (!onlineState.players?.length) return;
    onlineState.players.forEach((player) => {
      if (player?.color && player?.name) {
        // allow UI to pull names if needed (placeholder for future logic)
      }
    });
  }, [onlineState.players]);

  useEffect(() => {
    if (!onlineState.playerId || !onlineState.players?.length) return;
    const selfPlayer = onlineState.players.find(
      (player) => player.id === onlineState.playerId
    );
    if (!selfPlayer?.color) return;
    // Adjust orientation preference once server assigns a color
    setColorPreference(selfPlayer.color);
  }, [onlineState.playerId, onlineState.players]);

  const ensureSocketConnected = useCallback(() => {
    if (!enabled || !serverReady) {
      return Promise.reject(new Error("Le mode en ligne est indisponible."));
    }
    if (socket?.connected) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const handleResolve = () => {
        cleanup();
        resolve();
      };
      const handleReject = (err) => {
        cleanup();
        reject(new Error(err?.message ?? "Socket déconnectée"));
      };
      const cleanup = () => {
        socket?.off("connect", handleResolve);
        socket?.off("connect_error", handleReject);
      };
      socket?.once("connect", handleResolve);
      socket?.once("connect_error", handleReject);
      socket?.connect();
    });
  }, [enabled, serverReady, socket]);

  const emitWithAck = useCallback(
    (event, payload = {}) =>
      ensureSocketConnected()
        .then(
          () =>
            new Promise((resolve, reject) => {
              const hasTimeout = typeof socket.timeout === "function";
              const target = hasTimeout ? socket.timeout(5000) : socket;

              const handleAck = (...args) => {
                if (hasTimeout) {
                  const [err, response = {}] = args;
                  if (err) {
                    reject(new Error(err.message ?? "Action impossible"));
                    return;
                  }
                  if (response.ok) {
                    resolve(response);
                  } else {
                    reject(new Error(response.error ?? "Action impossible"));
                  }
                  return;
                }

                const [response = {}] = args;
                if (response.ok) {
                  resolve(response);
                } else {
                  reject(new Error(response.error ?? "Action impossible"));
                }
              };

              target.emit(event, payload, handleAck);
            })
        )
        .catch((error) => {
          setOnlineState((prev) => ({ ...prev, error: error.message }));
          throw error;
        }),
    [ensureSocketConnected, socket]
  );

  const resetAndSync = useCallback(() => {
    gameRef.current = new Chess();
    syncFromGame({ forceLatest: true });
  }, [syncFromGame]);

  const createRoom = useCallback(
    async ({ playerName, preferredColor } = {}) => {
      const response = await emitWithAck("room:create", {
        playerName,
        preferredColor:
          preferredColor === "random" ? undefined : preferredColor,
      });
      resetAndSync();
      setOnlineState((prev) => ({
        ...prev,
        roomId: response.room?.id ?? prev.roomId,
        playerId: response.playerId ?? prev.playerId,
        status: "waiting",
        result: null,
      }));
      return response;
    },
    [emitWithAck, resetAndSync]
  );

  const joinRoom = useCallback(
    async ({ roomId, playerName }) => {
      const response = await emitWithAck("room:join", { roomId, playerName });
      resetAndSync();
      setOnlineState((prev) => ({
        ...prev,
        roomId,
        playerId: response.playerId ?? prev.playerId,
        status: "ready",
        result: null,
      }));
      return response;
    },
    [emitWithAck, resetAndSync]
  );

  const leaveRoom = useCallback(async () => {
    if (!onlineState.roomId) return;
    await emitWithAck("room:leave", { roomId: onlineState.roomId });
    resetBoardState();
    setOnlineState(defaultOnlineState);
  }, [emitWithAck, onlineState.roomId, resetBoardState]);

  const sendMove = useCallback(
    async (movePayload) => {
      if (!onlineState.roomId) return;
      await emitWithAck("move:play", {
        roomId: onlineState.roomId,
        move: movePayload,
      });
    },
    [emitWithAck, onlineState.roomId]
  );

  const resignGame = useCallback(async () => {
    if (!onlineState.roomId) return;
    try {
      await ensureSocketConnected();
      socket.emit("game:resign", { roomId: onlineState.roomId });
      const selfColor = onlineState.players.find(
        (player) => player.id === onlineState.playerId
      )?.color;
      const winnerColor =
        selfColor === "white"
          ? "black"
          : selfColor === "black"
          ? "white"
          : null;
      setOnlineState((prev) => ({
        ...prev,
        result: buildResignResult(winnerColor),
        status: "ended",
      }));
    } catch (error) {
      setOnlineState((prev) => ({ ...prev, error: error.message }));
    }
  }, [ensureSocketConnected, onlineState.players, onlineState.playerId, onlineState.roomId, socket]);

  const handleDrop = useCallback(
    (sourceSquare, targetSquare) => {
      if (onlineState.result) return false;
      if (currentPly !== positions.length - 1) return false;
      const move = handleLocalMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false;
      const latestFen = gameRef.current.fen();
      sendMove({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
        san: move.san,
        lan: move.lan,
        fen: latestFen,
      }).catch((err) =>
        setOnlineState((prev) => ({ ...prev, error: err.message }))
      );
      return true;
    },
    [
      currentPly,
      handleLocalMove,
      onlineState.result,
      positions,
      sendMove,
      setOnlineState,
    ]
  );

  const goToPly = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(index, positions.length - 1));
      setCurrentPly(clamped);
      setPosition(positions[clamped]);
      setCaptureInfo(computeCaptureInfo(history, clamped));
    },
    [history, positions]
  );

  const goToStart = useCallback(() => goToPly(0), [goToPly]);

  const goToEnd = useCallback(
    () => goToPly(positions.length - 1),
    [goToPly, positions.length]
  );

  const stepBackward = useCallback(() => {
    if (currentPly === 0) return;
    goToPly(currentPly - 1);
  }, [currentPly, goToPly]);

  const stepForward = useCallback(() => {
    if (currentPly >= positions.length - 1) return;
    goToPly(currentPly + 1);
  }, [currentPly, positions.length, goToPly]);

  const mergedResult = onlineState.result ?? localResult;

  const boardOrientation = useMemo(() => {
    const player = onlineState.players.find(
      (p) => p.id === onlineState.playerId
    );
    if (player?.color === "black") return "black";
    return "white";
  }, [onlineState.playerId, onlineState.players]);

  const isOnLatestPly = currentPly === positions.length - 1;

  return {
    position,
    positions,
    history,
    currentPly,
    isOnLatestPly,
    goToPly,
    goToStart,
    goToEnd,
    stepBackward,
    stepForward,
    gameStatus,
    capturedPieces: captureInfo.capturedPieces,
    materialAdvantage: captureInfo.materialAdvantage,
    handleDrop,
    boardOrientation,
    onlineState,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMove,
    resignGame,
    colorPreference,
    setColorPreference,
    gameResult: mergedResult,
    socket,
  };
}
