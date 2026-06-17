'use client';

import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useMapStore } from '@/store/mapStore';
import type { SocketLocationPayload } from '@/types';

export function useMap() {
  const socket = useSocket();
  const { technicianLocations, updateTechnicianLocation } = useMapStore();

  useEffect(() => {
    socket.emit('join:dispatcher');

    const handleLocationUpdate = (payload: SocketLocationPayload) => {
      updateTechnicianLocation(payload.technicianId, payload.coordinates);
    };

    socket.on('location:update', handleLocationUpdate);
    return () => {
      socket.off('location:update', handleLocationUpdate);
    };
  }, [socket, updateTechnicianLocation]);

  return { technicianLocations };
}
