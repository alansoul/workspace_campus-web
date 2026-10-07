import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export const socket = io(WS_URL, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: Cookies.get('token') });
  },
});