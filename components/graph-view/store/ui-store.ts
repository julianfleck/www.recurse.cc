import { create } from 'zustand';

type UIState = {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  getCurrentLevel: () => number;
};

export const useUIStore = create<UIState>((set, get) => ({
  currentLevel: 0,
  setCurrentLevel: (level: number) =>
    set({ currentLevel: Math.max(0, Math.floor(level)) }),
  getCurrentLevel: () => get().currentLevel,
}));
