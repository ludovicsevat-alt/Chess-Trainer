export const SERVER_PORT = Number(process.env.SERVER_PORT ?? 4000);
export const CLIENT_ORIGINS = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

export const SOCKET_PATH = process.env.SOCKET_PATH ?? "/socket.io";
