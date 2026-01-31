import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const createSocket = (token: string): Socket => {
  if (socket && currentToken === token && socket.connected) {
    return socket;
  }

  if (socket && currentToken && currentToken !== token) {
    disconnectSocket();
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    // CRITICAL for Vercel: polling-first
    transports: ['polling', 'websocket'],
    // Increase timeouts for serverless
    timeout: 20000,
    upgrade: true
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

export default socket;
