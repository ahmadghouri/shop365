import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/client';

let socket = null;

export function initSocket(token) {
  if (socket) return socket;
  const url = (API_BASE_URL || '').replace(/\/api$/, '') || API_BASE_URL;
  socket = io(url, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token }
  });
  return socket;
}

export function joinRoom(room) {
  if (!socket) return;
  socket.emit('join', room);
}

export function onOrderStatusUpdated(cb) {
  if (!socket) return;
  socket.on('order:statusUpdated', cb);
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
