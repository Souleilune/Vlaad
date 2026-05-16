import { create } from "zustand";
import { BLOOD_TYPES } from "@vlaad/shared";

type FilterState = {
  selectedBloodTypes: string[];
  radiusKm: number;
  urgentOnly: boolean;
  toggleBloodType: (value: string) => void;
  setRadiusKm: (value: number) => void;
  setUrgentOnly: (value: boolean) => void;
};

export const useAppStore = create<FilterState>((set) => ({
  selectedBloodTypes: [...BLOOD_TYPES],
  radiusKm: 15,
  urgentOnly: false,
  toggleBloodType: (value) =>
    set((state) => ({
      selectedBloodTypes: state.selectedBloodTypes.includes(value)
        ? state.selectedBloodTypes.filter((item) => item !== value)
        : [...state.selectedBloodTypes, value]
    })),
  setRadiusKm: (value) => set({ radiusKm: value }),
  setUrgentOnly: (value) => set({ urgentOnly: value })
}));
