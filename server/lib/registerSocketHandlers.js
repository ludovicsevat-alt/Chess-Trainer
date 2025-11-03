export function registerSocketHandlers(io, rooms) {
  io.on("connection", (socket) => {
    const safeAck = (ack, payload) => {
      if (typeof ack === "function") {
        ack(payload);
      }
    };

    socket.on("room:create", (payload = {}, ack) => {
      try {
        const createdRoom = rooms.createRoom(socket.id, payload);
        socket.join(createdRoom.id);
        const serialized = rooms.serialize(createdRoom.id);
        safeAck(ack, { ok: true, room: serialized, playerId: socket.id });
        io.to(createdRoom.id).emit("room:update", { room: serialized });
      } catch (error) {
        safeAck(ack, { ok: false, error: error.message });
      }
    });

    socket.on("room:join", ({ roomId, playerName } = {}, ack) => {
      try {
        rooms.addPlayer(roomId, socket.id, { playerName });
        socket.join(roomId);
        const serialized = rooms.serialize(roomId);
        safeAck(ack, { ok: true, room: serialized, playerId: socket.id });
        io.to(roomId).emit("room:update", { room: serialized });
      } catch (error) {
        safeAck(ack, { ok: false, error: error.message });
      }
    });

    socket.on("room:leave", ({ roomId } = {}, ack) => {
      try {
        rooms.leaveRoom(roomId, socket.id);
        socket.leave(roomId);
        const serialized = rooms.serialize(roomId);
        safeAck(ack, { ok: true });
        if (serialized) {
          io.to(roomId).emit("room:update", { room: serialized });
        }
      } catch (error) {
        safeAck(ack, { ok: false, error: error.message });
      }
    });

    socket.on("move:play", ({ roomId, move } = {}, ack) => {
      try {
        rooms.recordMove(roomId, {
          ...move,
          playerId: socket.id,
        });
        socket.to(roomId).emit("move:played", { move, playerId: socket.id });
        safeAck(ack, { ok: true });
      } catch (error) {
        safeAck(ack, { ok: false, error: error.message });
      }
    });

    socket.on("game:resign", ({ roomId } = {}) => {
      if (!roomId) return;
      const room = rooms.getRoom(roomId);
      if (!room) return;
      const loserColor =
        room.players[socket.id]?.color ?? (room.players[socket.id] ? null : null);
      const winnerColor =
        loserColor === "white"
          ? "black"
          : loserColor === "black"
          ? "white"
          : null;
      rooms.setResult(roomId, {
        winner: winnerColor,
        loser: loserColor,
        outcome: winnerColor ?? "draw",
        reason: "resign",
      });
      socket.to(roomId).emit("game:resigned", { playerId: socket.id });
      const serialized = rooms.serialize(roomId);
      if (serialized) {
        io.to(roomId).emit("room:update", { room: serialized });
      }
    });

    socket.on("disconnect", () => {
      const result = rooms.removePlayerBySocket(socket.id);
      if (result?.room?.id && !result.room.deleted) {
        const serialized = rooms.serialize(result.room.id);
        io.to(result.room.id).emit("room:update", { room: serialized });
      }
    });
  });
}
