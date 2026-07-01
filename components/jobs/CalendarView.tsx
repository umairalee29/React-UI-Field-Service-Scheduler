'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import { JobDetailPanel } from './JobDetailPanel';
import { STATUS_COLORS } from '@/lib/jobConstants';
import type { IJob } from '@/types';

interface Props {
  jobs: IJob[];
}

export function CalendarView({ jobs }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const events = jobs.map((job) => ({
    id: job._id,
    title: `${job.jobNumber} — ${job.title}`,
    start: new Date(job.scheduledAt),
    end: new Date(new Date(job.scheduledAt).getTime() + job.estimatedDuration * 60 * 1000),
    backgroundColor: STATUS_COLORS[job.status],
    borderColor: STATUS_COLORS[job.status],
    textColor: '#f1f5f9',
  }));

  return (
    <>
      <div className="calendar-wrapper bg-bg-card rounded-xl p-4 border border-border-dark">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth',
          }}
          events={events}
          eventClick={({ event }) => setSelectedJobId(event.id)}
          height="calc(100vh - 240px)"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          nowIndicator
          allDaySlot={false}
        />
      </div>

      <JobDetailPanel
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />
    </>
  );
}
