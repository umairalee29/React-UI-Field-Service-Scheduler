'use client';

import { useEffect, useMemo } from 'react';
import { io, type Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function useSocket(): Socket {
  const socket = useMemo(() => {
    if (!socketInstance) {
      socketInstance = io(
        process.env['NEXT_PUBLIC_SOCKET_URL'] ?? 'http://localhost:3000',
        {
          path: '/api/socketio',
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }
      );
    }
    return socketInstance;
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      // Don't disconnect on unmount — socket is shared across components
    };
  }, [socket]);

  return socket;
}
