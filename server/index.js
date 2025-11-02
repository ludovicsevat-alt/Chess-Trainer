import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";
import { SERVER_PORT, CLIENT_ORIGINS, SOCKET_PATH } from "./config.js";
import GameRoomManager from "./lib/GameRoomManager.js";
import { registerSocketHandlers } from "./lib/registerSocketHandlers.js";

const app = express();
app.use(
  cors({
    origin: CLIENT_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  path: SOCKET_PATH,
  cors: {
    origin: CLIENT_ORIGINS,
    credentials: true,
  },
});

const rooms = new GameRoomManager();
registerSocketHandlers(io, rooms);

httpServer.listen(SERVER_PORT, () => {
  console.log(`✅ Chess Trainer server ready on http://localhost:${SERVER_PORT}`);
});
