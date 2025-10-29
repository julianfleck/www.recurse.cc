'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { create } from 'zustand';

interface UIState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;

  // Sidebar states
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  contextOpen: boolean;
  setContextOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isDarkMode: false,

  toggleDarkMode: () => {
    const currentState = get().isDarkMode;
    set({ isDarkMode: !currentState });
  },

  setDarkMode: (isDark: boolean) => {
    set({ isDarkMode: isDark });
  },

  // Sidebar states
  leftSidebarOpen: true,
  setLeftSidebarOpen: (open: boolean) => {
    set({ leftSidebarOpen: open });
  },

  chatOpen: false,
  setChatOpen: (open: boolean) => {
    set({ chatOpen: open });
  },

  contextOpen: false,
  setContextOpen: (open: boolean) => {
    set({ contextOpen: open });
  },
}));

// Hook to sync the store with next-themes
export const useThemeSync = () => {
  const { theme, setTheme } = useTheme();
  const { isDarkMode, setDarkMode } = useUIStore();

  // Sync store with theme changes
  useEffect(() => {
    const isDark = theme === 'dark';
    if (isDark !== isDarkMode) {
      setDarkMode(isDark);
    }
  }, [theme, isDarkMode, setDarkMode]);

  // Override toggleDarkMode to also update next-themes
  useEffect(() => {
    useUIStore.setState({
      toggleDarkMode: () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setTheme(newTheme);
        useUIStore.getState().setDarkMode(!isDarkMode);
      },
    });
  }, [isDarkMode, setTheme]);
};
