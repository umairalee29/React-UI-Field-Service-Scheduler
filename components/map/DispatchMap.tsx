'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/mapStore';
import { useMap as useMapHook } from '@/hooks/useMap';
import { JobMarker } from './JobMarker';
import { TechnicianMarker } from './TechnicianMarker';
import { MapLegend } from './MapLegend';
import type { IJob, TechnicianWithMeta } from '@/types';

// Fix default marker icons in webpack
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FlyToJob({ jobId, jobs }: { jobId: string | null; jobs: IJob[] }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (!jobId || jobId === prevId.current) return;
    const job = jobs.find((j) => j._id === jobId);
    if (job?.location?.coordinates) {
      const [lng, lat] = job.location.coordinates;
      if (lat !== undefined && lng !== undefined) {
        map.flyTo([lat, lng], 15, { duration: 1 });
      }
    }
    prevId.current = jobId;
  }, [jobId, jobs, map]);

  return null;
}

interface DispatchMapProps {
  jobs: IJob[];
  technicians?: TechnicianWithMeta[];
  onJobClick?: (job: IJob) => void;
  technicianOnly?: boolean;
  technicianId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function DispatchMap({
  jobs,
  technicians = [],
  onJobClick,
  technicianOnly = false,
  technicianId,
  initialCenter = [59.9139, 10.7522],
  initialZoom = 12,
}: DispatchMapProps) {
  const { technicianLocations, selectedJobId } = useMapStore();
  useMapHook();

  const visibleJobs = technicianOnly
    ? jobs.filter((j) => j.technicianId && (
      typeof j.technicianId === 'string'
        ? j.technicianId === technicianId
        : (j.technicianId as { _id: string })._id === technicianId
    ))
    : jobs;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full"
        style={{ background: '#0a0f1e' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <FlyToJob jobId={selectedJobId} jobs={visibleJobs} />

        {visibleJobs.map((job) => (
          <JobMarker
            key={job._id}
            job={job}
            onClick={onJobClick}
          />
        ))}

        {!technicianOnly && technicians.map((tech) => {
          const liveCoords = technicianLocations[tech._id];
          const coords: [number, number] | null = liveCoords
            ? [liveCoords[1], liveCoords[0]]
            : tech.latestLocation
              ? [tech.latestLocation.location.coordinates[1]!, tech.latestLocation.location.coordinates[0]!]
              : null;

          if (!coords) return null;
          return (
            <TechnicianMarker
              key={tech._id}
              technician={tech}
              position={coords}
            />
          );
        })}
      </MapContainer>

      <MapLegend />
    </div>
  );
}
