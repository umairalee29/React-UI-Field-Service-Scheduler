'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import type { IJob } from '@/types';

const DispatchMap = dynamic(
  () => import('@/components/map/DispatchMap').then((m) => m.DispatchMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-bg-card rounded-xl flex items-center justify-center text-text-secondary">Loading map…</div> }
);

export default function TechnicianMapPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<IJob[]>([]);

  useEffect(() => {
    fetch('/api/jobs?limit=50')
      .then((r) => r.json())
      .then((d) => { if (d.success) setJobs(d.data.jobs); });
  }, []);

  return (
    <div className="h-[calc(100vh-120px)]">
      <DispatchMap
        jobs={jobs}
        technicianOnly
        technicianId={session?.user?.id}
      />
    </div>
  );
}
