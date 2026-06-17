'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { TechnicianWithMeta } from '@/types';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TechnicianWithMeta | null>(null);

  useEffect(() => {
    fetch('/api/technicians')
      .then((r) => r.json())
      .then((d) => { if (d.success) setTechnicians(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async (tech: TechnicianWithMeta) => {
    await fetch(`/api/admin/users/${tech._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !tech.isAvailable }),
    });
    setTechnicians((prev) =>
      prev.map((t) => t._id === tech._id ? { ...t, isAvailable: !t.isAvailable } : t)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-heading">Technicians</h2>
          <p className="text-sm text-text-secondary mt-1">{technicians.length} field technicians</p>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {technicians.map((tech) => (
            <Card
              key={tech._id}
              hover
              className={`cursor-pointer ${selected?._id === tech._id ? 'border-accent-blue' : ''}`}
              onClick={() => setSelected(tech)}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={tech.name} src={tech.avatar} size="lg" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{tech.name}</p>
                  <p className="text-xs text-text-secondary">{tech.phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {(tech.skills ?? []).map((skill) => (
                  <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-bg-primary rounded text-text-secondary">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{tech.activeJobCount} active jobs</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleAvailability(tech); }}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors ${tech.isAvailable ? 'bg-accent-emerald/15 text-accent-emerald' : 'bg-bg-primary text-text-secondary'}`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${tech.isAvailable ? 'bg-accent-emerald' : 'bg-text-secondary'}`} />
                  {tech.isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
