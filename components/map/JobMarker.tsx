'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatScheduledAt } from '@/lib/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/jobConstants';
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
          <p className="font-mono text-[10px] text-text-secondary">{job.jobNumber}</p>
          <p className="font-semibold text-sm text-text-primary leading-snug">{job.title}</p>
          <p className="text-xs text-text-secondary">{job.customer.name}</p>
          <p className="text-xs text-text-secondary">
            {job.customer.address.street}, {job.customer.address.city}
          </p>
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: `${STATUS_COLORS[job.status]}25`, color: STATUS_COLORS[job.status] }}
          >
            {STATUS_LABELS[job.status]}
          </span>
          {techName && (
            <p className="text-xs text-text-secondary">
              Technician: <span className="text-text-primary font-medium">{techName}</span>
            </p>
          )}
          <p className="text-[10px] text-text-secondary">{formatScheduledAt(job.scheduledAt)}</p>
        </div>
      </Popup>
    </Marker>
  );
}
