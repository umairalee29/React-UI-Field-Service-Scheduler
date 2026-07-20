'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { TechnicianWithMeta } from '@/types';

function createTechIcon(name: string): L.DivIcon {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:#1a2235;border:2px solid #3b82f6;
        display:flex;align-items:center;justify-content:center;
        color:#3b82f6;font-weight:700;font-size:12px;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
      ">${initials}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

interface TechnicianMarkerProps {
  technician: TechnicianWithMeta;
  position: [number, number];
}

export function TechnicianMarker({ technician, position }: TechnicianMarkerProps) {
  return (
    <Marker
      position={position}
      icon={createTechIcon(technician.name)}
    >
      <Popup>
        <div className="min-w-[160px] space-y-1.5">
          <p className="font-semibold text-sm text-text-primary">{technician.name}</p>
          {technician.phone && (
            <p className="text-xs text-text-secondary">{technician.phone}</p>
          )}
          <p className="text-xs text-text-secondary">
            Active jobs:{' '}
            <span className="text-text-primary font-medium">{technician.activeJobCount}</span>
          </p>
          {technician.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {technician.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 text-[10px] rounded font-medium"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
