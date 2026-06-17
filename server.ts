import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env['NODE_ENV'] !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env['PORT'] ?? '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    path: '/api/socketio',
  });

  // Store io instance globally for API routes to access
  (global as { io?: Server }).io = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Dispatcher joins dispatcher room
    socket.on('join:dispatcher', () => {
      socket.join('dispatchers');
      console.log(`[Socket.io] ${socket.id} joined dispatchers room`);
    });

    // Technician joins their own room
    socket.on('join:technician', ({ technicianId }: { technicianId: string }) => {
      socket.join(`technician:${technicianId}`);
      socket.join(`user:${technicianId}`);
      console.log(`[Socket.io] ${socket.id} joined technician:${technicianId} room`);
    });

    // User-specific room (for notifications)
    socket.on('join:user', ({ userId }: { userId: string }) => {
      socket.join(`user:${userId}`);
    });

    // Technician broadcasts location to dispatchers
    socket.on(
      'location:ping',
      ({
        technicianId,
        coordinates,
        accuracy,
      }: {
        technicianId: string;
        coordinates: [number, number];
        accuracy: number;
      }) => {
        io.to('dispatchers').emit('location:update', {
          technicianId,
          coordinates,
          accuracy,
        });
      }
    );

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> DispatchIQ ready on http://${hostname}:${port} [${dev ? 'dev' : 'prod'}]`);
  });
});
