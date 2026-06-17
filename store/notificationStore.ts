'use client';

import { create } from 'zustand';
import type { INotification } from '@/types';

interface NotificationStore {
  notifications: INotification[];
  unreadCount: number;
  setNotifications: (notifications: INotification[], unreadCount: number) => void;
  addNotification: (notification: INotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
