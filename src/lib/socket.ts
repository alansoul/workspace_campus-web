import { io } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export const socket = io(WS_URL, {
  autoConnect: false,
  withCredentials: true, // Passes the httpOnly session cookie during WebSocket handshake
  transports: ['websocket', 'polling'], // Prioritizes native WebSockets over polling
});