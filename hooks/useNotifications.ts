'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useNotificationStore } from '@/store/notificationStore';
import { useSocket } from './useSocket';
import type { INotification } from '@/types';

export function useNotifications() {
  const { data: session } = useSession();
  const { notifications, unreadCount, setNotifications, addNotification, markRead, markAllRead } =
    useNotificationStore();
  const socket = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications, data.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [setNotifications]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      socket.emit('join:user', { userId: session.user.id });
    }
  }, [session?.user?.id, fetchNotifications, socket]);

  useEffect(() => {
    const handleNewNotification = ({ notification }: { notification: INotification }) => {
      addNotification(notification);
    };
    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, addNotification]);

  const markOneRead = useCallback(
    async (id: string) => {
      markRead(id);
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    },
    [markRead]
  );

  const markAll = useCallback(async () => {
    markAllRead();
    await fetch('/api/notifications', { method: 'PATCH' });
  }, [markAllRead]);

  return { notifications, unreadCount, markOneRead, markAll, refetch: fetchNotifications };
}
