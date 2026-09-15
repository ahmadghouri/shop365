import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/api/client";
import { Platform } from "react-native";
import { useNotificationStore } from "./notificationStore";

let socket: Socket | null = null;
let reconnectCount = 0;

export function connectSocket(token: string) {
  if (socket?.connected) return;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  console.log(
    "[Socket] Connecting to:",
    API_BASE_URL,
    "| platform:",
    Platform.OS,
  );

  const isHttps = API_BASE_URL.startsWith("https://");
  const extraHeaders: Record<string, string> = {};
  if (isHttps) {
    extraHeaders["User-Agent"] = `ExpoApp/${Platform.OS}`;
  }

  socket = io(API_BASE_URL, {
    path: "/socket.io",
    auth: { token },
    query: { token },
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 15000,
    timeout: 30000,
    forceNew: true,
    upgrade: true,
    rememberUpgrade: false,
    withCredentials: false,
    extraHeaders,
    secure: isHttps,
  });

  socket.on("connect", () => {
    reconnectCount = 0;
    const transport = socket?.io?.engine?.transport?.name;
    console.log("[Socket] Connected:", socket?.id, "| transport:", transport);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[Socket] Disconnected:", reason);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    reconnectCount = attemptNumber;
    console.log("[Socket] Reconnect attempt:", attemptNumber);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("[Socket] Reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_failed", () => {
    console.warn("[Socket] Reconnect failed — all attempts exhausted");
  });

  socket.on("connect_error", (err) => {
    console.warn(
      "[Socket] Connection error:",
      err.message,
      "| url:",
      API_BASE_URL,
    );
    if (
      err.message &&
      (err.message.toLowerCase().includes("cors") ||
        err.message.toLowerCase().includes("403"))
    ) {
      console.warn(
        "[Socket] CORS/auth issue detected — check server CORS_ORIGINS or token validity",
      );
    }
    if (reconnectCount > 0 && reconnectCount % 5 === 0) {
      console.warn(
        "[Socket] Still failing after",
        reconnectCount,
        "attempts. Check server reachability / Nginx / SSL.",
      );
    }
  });

  socket.on("notification", (payload) => {
    useNotificationStore.getState().addNotification(payload);
  });
}

export function disconnectSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}
