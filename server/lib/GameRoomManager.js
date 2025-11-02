import crypto from "node:crypto";

const COLORS = ["white", "black"];

const randomId = () =>
  crypto.randomUUID?.().replace(/-/g, "").slice(0, 8) ??
  Math.random().toString(36).slice(2, 10);

export default class GameRoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  createRoom(
    socketId,
    { playerName = "HÃ´te", preferredColor = "white" } = {}
  ) {
    const id = randomId();
    const room = {
      id,
      createdAt: Date.now(),
      hostId: socketId,
      moves: [],
      status: "waiting",
      settings: {
        preferredColor,
      },
      players: {},
      result: null,
    };
    this.rooms.set(id, room);
    this.addPlayer(room.id, socketId, {
      playerName,
      preferredColor,
    });
    return room;
  }

  addPlayer(roomId, socketId, { playerName = "InvitÃ©", preferredColor } = {}) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error("Salle introuvable");
    }

    const assignedColor = this.resolveColor(room, preferredColor);
    room.players[socketId] = {
      id: socketId,
      name: playerName,
      color: assignedColor,
      joinedAt: Date.now(),
    };

    if (Object.keys(room.players).length >= 2) {
      room.status = "ready";
      room.result = null;
    }

    return room;
  }

  resolveColor(room, preferredColor) {
    if (!preferredColor || preferredColor === "random") {
      return this.pickAvailableColor(room);
    }

    const colorAlreadyTaken = Object.values(room.players).some(
      (player) => player.color === preferredColor
    );

    if (colorAlreadyTaken) {
      return this.pickAvailableColor(room);
    }

    return COLORS.includes(preferredColor) ? preferredColor : "white";
  }

  pickAvailableColor(room) {
    const colorsInUse = new Set(
      Object.values(room.players).map((player) => player.color)
    );
    if (!colorsInUse.has("white")) return "white";
    if (!colorsInUse.has("black")) return "black";
    return Math.random() < 0.5 ? "white" : "black";
  }

  recordMove(roomId, move) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Salle introuvable");
    room.moves.push({
      ...move,
      createdAt: Date.now(),
    });
    room.result = null;
    return room;
  }

  removePlayerBySocket(socketId) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.players[socketId]) {
        delete room.players[socketId];
        room.status = "waiting";
        room.result = null;
        if (Object.keys(room.players).length === 0) {
          this.rooms.delete(roomId);
          return { room: { ...room, deleted: true } };
        }
        return { room };
      }
    }
    return null;
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Salle introuvable");
    delete room.players[socketId];
    room.status = "waiting";
    room.result = null;
    if (Object.keys(room.players).length === 0) {
      this.rooms.delete(roomId);
    }
    return room;
  }

  setResult(roomId, result) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Salle introuvable");
    room.result = result ?? null;
    if (room.result) {
      room.status = "ended";
    }
    return room;
  }

  serialize(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return {
      id: room.id,
      status: room.status,
      createdAt: room.createdAt,
      settings: room.settings,
      moves: room.moves,
      players: Object.values(room.players),
      result: room.result,
    };
  }
}
