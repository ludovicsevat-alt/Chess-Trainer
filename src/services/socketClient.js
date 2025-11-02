import { io } from "socket.io-client";

export const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

let socketInstance;

export function getSocketClient() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_BASE_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = undefined;
  }
}
