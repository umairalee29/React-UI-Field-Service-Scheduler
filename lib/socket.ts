import type { Server } from 'socket.io';
import type { IJob, INotification } from '@/types';

declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
}

export function getIO(): Server | null {
  return globalThis.io ?? null;
}

export function emitToDispatchers(event: string, data: unknown): void {
  const io = getIO();
  io?.to('dispatchers').emit(event, data);
}

export function emitToTechnician(technicianId: string, event: string, data: unknown): void {
  const io = getIO();
  io?.to(`technician:${technicianId}`).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  const io = getIO();
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitJobCreated(job: IJob): void {
  emitToDispatchers('job:created', { job });
}

export function emitJobAssigned(job: IJob, technicianId: string): void {
  emitToTechnician(technicianId, 'job:assigned', { job });
  emitToDispatchers('job:statusChanged', { job });
}

export function emitJobStatusChanged(job: IJob): void {
  emitToDispatchers('job:statusChanged', { job });
}

export function emitNotification(userId: string, notification: INotification): void {
  emitToUser(userId, 'notification:new', { notification });
}
