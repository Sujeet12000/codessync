// frontend/src/socket/socket.js
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

const socket = io(BACKEND_URL, {
  // Don't connect until we explicitly call socket.connect()
  autoConnect: false,

  // Reconnection strategy
  reconnection:        true,
  reconnectionAttempts: 10,
  reconnectionDelay:   1_000,
  reconnectionDelayMax: 5_000,
});

export default socket;