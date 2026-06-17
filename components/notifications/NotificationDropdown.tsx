'use client';

import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/formatters';
import type { INotification } from '@/types';

const typeIcons: Record<string, string> = {
  job_assigned: '📋',
  job_updated: '🔄',
  job_completed: '✅',
  new_job: '➕',
  system: 'ℹ️',
};

function NotificationItem({
  notification,
  onRead,
}: {
  notification: INotification;
  onRead: (id: string) => void;
}) {
  const jobId = typeof notification.jobId === 'string'
    ? notification.jobId
    : (notification.jobId as { _id: string } | undefined)?._id;

  return (
    <div
      className={`flex gap-3 px-4 py-3 hover:bg-bg-card transition-colors cursor-pointer ${!notification.read ? 'border-l-2 border-accent-blue' : 'border-l-2 border-transparent'}`}
      onClick={() => !notification.read && onRead(notification._id)}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[notification.type] ?? 'ℹ️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{notification.title}</p>
        <p className="text-xs text-text-secondary line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-text-secondary/60 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 bg-accent-blue rounded-full flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markOneRead, markAll } = useNotifications();

  return (
    <div className="bg-bg-secondary border border-border-dark rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-text-secondary">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            className="text-xs text-accent-blue hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-text-secondary">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} onRead={markOneRead} />
          ))
        )}
      </div>

      <div className="border-t border-border-dark px-4 py-2">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-xs text-accent-blue hover:underline"
        >
          View all
        </Link>
      </div>
    </div>
  );
}
