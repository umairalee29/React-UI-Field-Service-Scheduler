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
        <div className="min-w-[160px] space-y-1">
          <div className="font-semibold text-sm">{technician.name}</div>
          <div className="text-xs text-gray-500">{technician.phone}</div>
          <div className="text-xs text-gray-600">Active jobs: {technician.activeJobCount}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {technician.skills.slice(0, 3).map((s) => (
              <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
