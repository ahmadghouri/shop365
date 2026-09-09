import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/api/client';
import { useNotificationStore } from './notificationStore';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return;

  socket = io(API_BASE_URL, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  // Real-time notification from backend
  socket.on('notification', (payload) => {
    useNotificationStore.getState().addNotification(payload);
  });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
