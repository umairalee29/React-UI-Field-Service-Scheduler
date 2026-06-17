'use client';

import { create } from 'zustand';
import type { IJob, JobFilters } from '@/types';

interface JobStore {
  jobs: IJob[];
  selectedJobId: string | null;
  filters: JobFilters;
  isLoading: boolean;
  setJobs: (jobs: IJob[]) => void;
  addJob: (job: IJob) => void;
  updateJob: (id: string, updates: Partial<IJob>) => void;
  setSelectedJobId: (id: string | null) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultFilters: JobFilters = {
  status: '',
  priority: '',
  technicianId: '',
  search: '',
  dateFrom: '',
  dateTo: '',
};

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  selectedJobId: null,
  filters: { ...defaultFilters },
  isLoading: false,
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j._id === id ? { ...j, ...updates } : j)),
    })),
  setSelectedJobId: (id) => set({ selectedJobId: id }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
