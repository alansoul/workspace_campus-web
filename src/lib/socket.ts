import { io, Socket } from 'socket.io-client';

const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || 'https://workspace-campus-api.onrender.com';

function getSocketUrl(url: string): string {
  if (typeof window !== 'undefined') {
    // If relative path like '/api' or empty, use current window origin
    if (!url || url.startsWith('/')) {
      return window.location.origin;
    }
  }

  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
}

const SOCKET_URL = getSocketUrl(rawUrl);

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