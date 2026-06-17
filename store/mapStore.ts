'use client';

import { create } from 'zustand';

interface MapStore {
  technicianLocations: Record<string, [number, number]>;
  selectedJobId: string | null;
  selectedTechnicianId: string | null;
  updateTechnicianLocation: (technicianId: string, coords: [number, number]) => void;
  setSelectedJobId: (id: string | null) => void;
  setSelectedTechnicianId: (id: string | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  technicianLocations: {},
  selectedJobId: null,
  selectedTechnicianId: null,
  updateTechnicianLocation: (technicianId, coords) =>
    set((state) => ({
      technicianLocations: { ...state.technicianLocations, [technicianId]: coords },
    })),
  setSelectedJobId: (id) => set({ selectedJobId: id }),
  setSelectedTechnicianId: (id) => set({ selectedTechnicianId: id }),
}));
