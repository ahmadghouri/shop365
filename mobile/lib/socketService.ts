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

  // Sanitize token: strip accidental "Bearer " prefix before sending,
  // server also strips defensively but doing it client-side saves a round trip.
  const cleanToken =
    token && token.toLowerCase().startsWith("bearer ")
      ? token.slice(7).trim()
      : (token || "").trim();

  const isHttps = API_BASE_URL.startsWith("https://");
  const extraHeaders: Record<string, string> = {};
  if (isHttps) {
    extraHeaders["User-Agent"] = `ExpoApp/${Platform.OS}`;
  }

  socket = io(API_BASE_URL, {
    path: "/socket.io",
    auth: { token: cleanToken },
    query: { token: cleanToken },
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

  socket.on("connect_error", (err: any) => {
    const ctx: Record<string, unknown> = {
      message: err?.message,
      url: API_BASE_URL,
    };
    if (err?.context) ctx.context = err.context;
    if (err?.description) ctx.description = err.description;
    const statusCode = err?.data?.statusCode || err?.status;
    if (statusCode) ctx.statusCode = statusCode;
    const responseBody = err?.data?.body?.toString?.();
    if (responseBody) ctx.body = responseBody.slice(0, 400);
    console.warn("[Socket] Connection error:", JSON.stringify(ctx));
    const msg = (err?.message || "").toLowerCase();
    if (msg.includes("cors") || msg.includes("403")) {
      console.warn(
        "[Socket] CORS/auth issue detected — check server CORS_ORIGINS or token validity",
      );
    }
    if (msg.includes("server error") || statusCode === 500) {
      console.warn(
        "[Socket] Server returned 500 during handshake — check server logs for socket auth middleware / DB errors",
      );
    }
    if (
      msg.includes("user not found") ||
      msg.includes("invalid token") ||
      msg.includes("authentication error")
    ) {
      console.warn(
        "[Socket] Auth failure on server — token may be expired or user deleted; try re-login.",
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
