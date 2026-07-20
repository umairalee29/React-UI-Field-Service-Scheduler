'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { formatScheduledAt } from '@/lib/formatters';
import { STATUS_COLORS } from '@/lib/jobConstants';
import type { IJob, JobStatus } from '@/types';

function createJobIcon(status: JobStatus): L.DivIcon {
  const color = STATUS_COLORS[status];
  return L.divIcon({
    className: '',
    html: `
      <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 9.941 14 22 14 22S28 23.941 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
        <circle cx="14" cy="14" r="6" fill="white" fill-opacity="0.9"/>
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

interface JobMarkerProps {
  job: IJob;
  onClick?: (job: IJob) => void;
}

export function JobMarker({ job, onClick }: JobMarkerProps) {
  const [lng, lat] = job.location.coordinates;
  if (!lat || !lng) return null;

  const techName = typeof job.technicianId === 'object' && job.technicianId
    ? (job.technicianId as { name: string }).name
    : null;

  return (
    <Marker
      position={[lat, lng]}
      icon={createJobIcon(job.status)}
      eventHandlers={{
        click: () => onClick?.(job),
      }}
    >
      <Popup className="custom-popup">
        <div className="min-w-[200px] space-y-2">
          <div className="font-mono text-xs text-gray-500">{job.jobNumber}</div>
          <div className="font-semibold text-sm">{job.title}</div>
          <div className="text-xs text-gray-600">{job.customer.name}</div>
          <div className="text-xs text-gray-500">{job.customer.address.street}, {job.customer.address.city}</div>
          <div className="flex gap-1 flex-wrap">
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium`} style={{ background: `${STATUS_COLORS[job.status]}25`, color: STATUS_COLORS[job.status] }}>
              {job.status.replace(/_/g, ' ')}
            </span>
          </div>
          {techName && <div className="text-xs text-gray-600">👷 {techName}</div>}
          <div className="text-xs text-gray-500">{formatScheduledAt(job.scheduledAt)}</div>
        </div>
      </Popup>
    </Marker>
  );
}
