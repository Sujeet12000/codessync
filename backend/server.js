// backend/server.js
import express       from 'express';
import http          from 'http';
import { Server }    from 'socket.io';
import cors          from 'cors';

const app    = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173',
  'https://codessync.vercel.app'
  'https://codessync-o75sydb2a-sujeetc1029-2517s-projects.vercel.app'
];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,   // Vite dev server
    methods: ['GET', 'POST'],
  },
  // Tune for low-latency text edits
  pingInterval: 10_000,
  pingTimeout:  5_000,
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/', (_req, res) => res.send('CodeSync backend running.'));

// ── In-memory room registry ──────────────────────────────────────────────────
// rooms: Map<roomId, { code: string, clients: Map<socketId, username> }>
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code:    'function hello() {\n  console.log("CodeSync");\n}',
      clients: new Map(),
    });
  }
  return rooms.get(roomId);
}

// ── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[connect]    ${socket.id}`);

  // ── join-room ──────────────────────────────────────────────────────────────
  // Payload: { roomId: string, username: string }
  socket.on('join-room', ({ roomId, username }) => {
    if (!roomId || !username) return;

    socket.join(roomId);

    const room = getRoom(roomId);
    room.clients.set(socket.id, username);

    // Tag socket so we can clean up on disconnect
    socket.data.roomId   = roomId;
    socket.data.username = username;

    console.log(`[join-room]  ${username} (${socket.id}) → room "${roomId}"`);

    // Send the current room code only to the joining client
    socket.emit('room-joined', {
      code:    room.code,
      clients: [...room.clients.values()],
    });

    // Tell everyone else a new user arrived
    socket.to(roomId).emit('user-joined', {
      username,
      clients: [...room.clients.values()],
    });
  });

  // ── code-change ────────────────────────────────────────────────────────────
  // Payload: { roomId: string, code: string }
  socket.on('code-change', ({ roomId, code }) => {
  console.log('CODE RECEIVED:', roomId, code);

  if (!roomId || code === undefined) return;

  const room = getRoom(roomId);
  room.code = code;

  console.log('BROADCASTING TO ROOM:', roomId);

  socket.to(roomId).emit('receive-code-change', { code });
});
    
    

  // ── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    const { roomId, username } = socket.data;
    console.log(`[disconnect] ${username ?? socket.id} — ${reason}`);

    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.clients.delete(socket.id);

      if (room.clients.size === 0) {
        // Keep code in memory for 10 min, then GC
        setTimeout(() => {
          if (rooms.get(roomId)?.clients.size === 0) {
            rooms.delete(roomId);
            console.log(`[gc]         room "${roomId}" removed`);
          }
        }, 10 * 60 * 1000);
      } else {
        // Notify remaining clients
        io.to(roomId).emit('user-left', {
          username,
          clients: [...room.clients.values()],
        });
      }
    }
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 5000;
server.listen(PORT, () => console.log(`CodeSync backend → http://localhost:${PORT}`));