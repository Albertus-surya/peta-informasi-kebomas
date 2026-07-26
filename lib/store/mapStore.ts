import { create } from "zustand";
import type { LocationWithCategory } from "@/types/database";

interface MapState {
  selectedLocation: LocationWithCategory | null;
  mapCenter: [number, number] | null;
  activeCategory: string | null;
  searchQuery: string;
  setSelectedLocation: (location: LocationWithCategory | null) => void;
  flyToLocation: (location: LocationWithCategory) => void;
  setActiveCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedLocation: null,
  mapCenter: null,
  activeCategory: null,
  searchQuery: "",
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  flyToLocation: (location) =>
    set({
      selectedLocation: location,
      mapCenter: [location.latitude, location.longitude],
    }),
  setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  reset: () =>
    set({ selectedLocation: null, mapCenter: null, activeCategory: null }),
}));
