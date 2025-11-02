import { useState } from "react";
import GameHistoryPanel from "./GameHistoryPanel";
import MoveNavigator from "./MoveNavigator";
import { useSettings } from "../contexts/SettingsContext";
import { COLOR_CHOICES } from "../constants/colorChoices";

function formatControl(time, inc, messages) {
  if (time === "none") return messages.timeNoClock;
  return `${time}' + ${inc}s`;
}

export default function OnlineRightMenuContent({ onlineGame }) {
  const { messages } = useSettings();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [localError, setLocalError] = useState(null);

  if (!onlineGame) {
    return (
      <div className="panel" style={{ padding: 16, textAlign: "center" }}>
        <div className="panel-title">{messages.onlineTitle}</div>
        <div className="history-empty">Mode en ligne inactif.</div>
      </div>
    );
  }

  const {
    onlineState = {},
    createRoom,
    joinRoom,
    leaveRoom,
    resignGame,
    history = [],
    positions = [],
    currentPly = 0,
    isOnLatestPly,
    goToStart,
    stepBackward,
    stepForward,
    goToEnd,
    goToPly,
    colorPreference,
    setColorPreference,
    gameStatus,
  } = onlineGame;

  const isConnected = Boolean(onlineState.connected);
  const inRoom = Boolean(onlineState.roomId);
  const waiting = onlineState.status === "waiting";
  const ended = onlineState.status === "ended";
  const result = onlineState.result;
  const players = onlineState.players ?? [];
  const selfPlayer = players.find((player) => player.id === onlineState.playerId);
  const opponentPlayer = players.find((player) => player.id !== onlineState.playerId);

  const preferredColor = colorPreference ?? "white";
  const [timeChoice, timeIncrement] = ["none", "0"]; // timers geres ulterieurement

  const setErrorMessage = (message) => {
    setLocalError(message ?? "Une erreur est survenue.");
  };

  const handleCreateRoom = async () => {
    if (!createRoom || !isConnected || inRoom) return;
    setPendingAction("create");
    setLocalError(null);
    try {
      await createRoom({
        playerName: playerName.trim() || messages.playerYou,
        preferredColor,
      });
      setRoomCode("");
    } catch (error) {
      setErrorMessage(error?.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoom || !isConnected || inRoom) return;
    const roomId = roomCode.trim();
    if (!roomId) return;
    setPendingAction("join");
    setLocalError(null);
    try {
      await joinRoom({
        roomId,
        playerName: playerName.trim() || messages.playerYou,
      });
    } catch (error) {
      setErrorMessage(error?.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleLeaveRoom = async () => {
    if (!leaveRoom || !inRoom) return;
    setPendingAction("leave");
    setLocalError(null);
    try {
      await leaveRoom();
    } catch (error) {
      setErrorMessage(error?.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleResign = async () => {
    if (!resignGame || !inRoom || waiting || ended) return;
    setPendingAction("resign");
    setLocalError(null);
    try {
      await resignGame();
    } catch (error) {
      setErrorMessage(error?.message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleCopyRoomId = async () => {
    if (!onlineState.roomId || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(onlineState.roomId);
    } catch {
      setErrorMessage("Impossible de copier l'identifiant.");
    }
  };

  const handleSelectMove = (ply) => {
    goToPly?.(ply);
  };

  const isBusy = Boolean(pendingAction);
  const canCreate = isConnected && !inRoom && !isBusy && !onlineState.error;
  const canJoin =
    isConnected &&
    !inRoom &&
    !isBusy &&
    roomCode.trim().length >= 4 &&
    !onlineState.error;
  const canLeave = inRoom && !isBusy;
  const canResign = inRoom && !waiting && !ended && !isBusy;

  const statusLabel = !isConnected
    ? "Deconnecte du serveur"
    : inRoom
    ? waiting
      ? "Salle creee, en attente d'un adversaire"
      : ended
      ? "Partie terminee"
      : "Adversaire connecte, la partie peut commencer"
    : "Connecte, aucune salle active";

  let resultMessage = null;
  if (result) {
    if (result.outcome === "draw") {
      resultMessage = "Partie nulle.";
    } else if (selfPlayer && result.winner === selfPlayer.color) {
      resultMessage = "Victoire par abandon.";
    } else if (selfPlayer && result.winner && result.winner !== selfPlayer.color) {
      resultMessage = "Defaite par abandon.";
    } else {
      resultMessage = "La partie est terminee.";
    }
  }

  const maxPly = Math.max(positions.length - 1, 0);

  return (
    <>
      <div className="ai-title">{messages.onlineTitle}</div>

      <div
        className="panel"
        style={{
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: isConnected ? "#3ecf8e" : "#ff647c",
              display: "inline-block",
            }}
          />
          <strong>{statusLabel}</strong>
        </div>
        {onlineState.error && (
          <div className="history-empty" style={{ color: "#ff647c" }}>
            {onlineState.error}
          </div>
        )}
        {localError && (
          <div className="history-empty" style={{ color: "#ff647c" }}>
            {localError}
          </div>
        )}
        {gameStatus?.message && (
          <div className="muted" style={{ textAlign: "center" }}>
            {gameStatus.message}
          </div>
        )}
      </div>

      <div className="config-panel">
        <div className="section-label">{messages.chooseSideLabel}</div>
        <div className="color-grid">
          {COLOR_CHOICES.map((choice) => (
            <button
              key={choice.id}
              className={`choice-btn ${
                colorPreference === choice.id ? "active" : ""
              }`}
              onClick={() => setColorPreference?.(choice.id)}
              disabled={inRoom || isBusy}
            >
              <span>{choice.icon}</span>
              {messages.colorLabels?.[choice.id] ?? choice.id}
            </button>
          ))}
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          {messages.playerNamesTitle}
        </div>
        <div className="form-field">
          <label>{messages.playerOne}</label>
          <input
            type="text"
            value={playerName}
            placeholder={messages.playerOne}
            onChange={(event) => setPlayerName(event.target.value)}
            disabled={isBusy}
          />
        </div>

        <div className="section-label" style={{ marginTop: 16 }}>
          {messages.timeControlTitle}
        </div>
        <div className="time-grid">
          <select value={timeChoice} disabled>
            <option value="none">{messages.timeNoClock}</option>
          </select>
          <select value={timeIncrement} disabled>
            <option value="0">+0 s</option>
          </select>
        </div>

        <div className="elo-value" style={{ marginTop: 8 }}>
          {messages.timeSelectedPrefix}: {formatControl(timeChoice, timeIncrement, messages)}
        </div>

        <button className="btn-primary" onClick={handleCreateRoom} disabled={!canCreate}>
          {pendingAction === "create" ? "Creation..." : messages.startMatch}
        </button>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="section-label">Salle active</div>
        {inRoom ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <code style={{ fontSize: 16 }}>{onlineState.roomId}</code>
            <button className="btn-secondary" onClick={handleCopyRoomId}>
              Copier
            </button>
          </div>
        ) : (
          <div className="history-empty">Aucune salle ouverte.</div>
        )}
      </div>

      {resultMessage && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="section-label">Resultat</div>
          <div className="history-item">{resultMessage}</div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="section-label">Joueurs connectes</div>
        {players.length === 0 && (
          <div className="history-empty">En attente d'un joueur.</div>
        )}
        {players.map((player) => (
          <div key={player.id} className="history-item">
            <span
              className={`player-color-dot ${player.color}`}
              style={{ marginRight: 8 }}
            />
            {player.name ?? "Sans nom"}
            {player.id === onlineState.playerId ? " (vous)" : ""}
          </div>
        ))}
      </div>

      <GameHistoryPanel
        history={history}
        activePly={currentPly}
        onSelectMove={handleSelectMove}
      />

      <MoveNavigator
        currentPly={currentPly}
        maxPly={maxPly}
        onStart={goToStart}
        onPrev={stepBackward}
        onNext={stepForward}
        onEnd={goToEnd}
        isLatest={Boolean(isOnLatestPly)}
      />

      {canResign && (
        <button className="btn-danger" onClick={handleResign}>
          {pendingAction === "resign" ? "Abandon..." : messages.resign}
        </button>
      )}

      <button className="btn-secondary" onClick={handleLeaveRoom} disabled={!canLeave}>
        {pendingAction === "leave" ? "Deconnexion..." : "Quitter la salle"}
      </button>

      {!inRoom && (
        <>
          <div className="section-label" style={{ marginTop: 16 }}>
            Rejoindre une salle existante
          </div>
          <div className="form-field">
            <input
              type="text"
              placeholder="ID de salle"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value)}
              disabled={isBusy || inRoom}
            />
          </div>
          <button className="btn-secondary" onClick={handleJoinRoom} disabled={!canJoin}>
            {pendingAction === "join" ? "Connexion..." : "Rejoindre"}
          </button>
        </>
      )}
    </>
  );
}
