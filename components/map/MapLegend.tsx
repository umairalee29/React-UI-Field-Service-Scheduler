'use client';

import { useState } from 'react';
import { JOB_STATUSES, STATUS_COLORS, STATUS_LABELS } from '@/lib/jobConstants';

export function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 right-4 z-[1000] bg-bg-secondary/90 backdrop-blur border border-border-dark rounded-xl overflow-hidden shadow-xl">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-primary w-full hover:bg-bg-card transition-colors"
      >
        <span>Legend</span>
        <span className="ml-auto">{collapsed ? '▲' : '▼'}</span>
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 space-y-1.5">
          {JOB_STATUSES.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-xs text-text-secondary">{STATUS_LABELS[status]}</span>
            </div>
          ))}
          <div className="border-t border-border-dark pt-1.5 mt-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-accent-blue bg-bg-card flex items-center justify-center">
                <span className="text-[8px] text-accent-blue font-bold">T</span>
              </div>
              <span className="text-xs text-text-secondary">Technician</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
