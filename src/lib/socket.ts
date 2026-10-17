import { io, Socket } from 'socket.io-client';

const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || 'https://workspace-campus-api.onrender.com';

// Extract the origin to avoid Socket.io treating paths (like /api) as namespaces
function cleanSocketUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
}

const SOCKET_URL = cleanSocketUrl(rawUrl);

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  return socket;
};