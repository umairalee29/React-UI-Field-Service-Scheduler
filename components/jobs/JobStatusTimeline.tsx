import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatScheduledAt } from '@/lib/formatters';
import type { IStatusHistory, IUser } from '@/types';

interface Props {
  history: IStatusHistory[];
}

export function JobStatusTimeline({ history }: Props) {
  if (!history?.length) {
    return <p className="text-sm text-text-secondary">No status history yet.</p>;
  }

  return (
    <ol className="relative space-y-0">
      {history.map((entry, i) => {
        const changedBy = typeof entry.changedBy === 'object'
          ? (entry.changedBy as IUser)
          : null;
        const isLast = i === history.length - 1;

        return (
          <li key={entry._id} className="flex gap-4 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-accent-blue mt-1 flex-shrink-0" />
              {!isLast && <div className="w-px flex-1 bg-border-dark mt-1" />}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={entry.status} />
                {changedBy && (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={changedBy.name} src={changedBy.avatar} size="sm" />
                    <span className="text-xs text-text-secondary">{changedBy.name}</span>
                  </div>
                )}
              </div>
              {entry.note && (
                <p className="text-xs text-text-secondary mb-1">"{entry.note}"</p>
              )}
              <p className="text-[10px] text-text-secondary/60">
                {formatScheduledAt(entry.changedAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
