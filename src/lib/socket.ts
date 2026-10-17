// campus-web/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

function getSocketUrl(): string {
  // 1. Prioritize the dedicated WebSocket Render URL from Vercel env
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl && wsUrl.startsWith('http')) {
    return wsUrl.replace(/\/+$/, '');
  }

  // 2. If NEXT_PUBLIC_API_URL is a full absolute URL, extract its origin
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      // Fallback below
    }
  }

  // 3. Fallback: In production, ALWAYS connect directly to Render, NEVER to Vercel
  if (process.env.NODE_ENV === 'production') {
    return 'https://workspace-campus-api.onrender.com';
  }

  return 'http://localhost:4000';
}

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  return socket;
};