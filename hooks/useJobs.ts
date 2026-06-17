'use client';

import { useEffect, useCallback } from 'react';
import { useJobStore } from '@/store/jobStore';
import { useSocket } from './useSocket';
import type { IJob, JobFilters } from '@/types';

export function useJobs(filters?: JobFilters) {
  const { jobs, setJobs, updateJob, addJob, isLoading, setLoading } = useJobStore();
  const socket = useSocket();

  const fetchJobs = useCallback(async (f?: JobFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const activeFilters = f ?? filters ?? {};
      for (const [key, value] of Object.entries(activeFilters)) {
        if (value) params.set(key, value);
      }
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data.jobs);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, setJobs, setLoading]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const handleJobCreated = ({ job }: { job: IJob }) => {
      addJob(job);
    };
    const handleJobStatusChanged = ({ job }: { job: IJob }) => {
      updateJob(job._id, job);
    };

    socket.on('job:created', handleJobCreated);
    socket.on('job:statusChanged', handleJobStatusChanged);
    socket.on('job:assigned', handleJobStatusChanged);

    return () => {
      socket.off('job:created', handleJobCreated);
      socket.off('job:statusChanged', handleJobStatusChanged);
      socket.off('job:assigned', handleJobStatusChanged);
    };
  }, [socket, addJob, updateJob]);

  return { jobs, isLoading, refetch: fetchJobs };
}
