'use client';

import { create } from 'zustand';

/**
 * Shared UI state that persists across all apps
 * Uses localStorage to sync theme and UI preferences across subdomains
 */
export type UIState = {
  // Theme preference (synced with next-themes)
  // Note: next-themes already persists theme, but we can track it here for cross-app awareness
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Sidebar states (app-specific, but stored for consistency)
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  
  contextOpen: boolean;
  setContextOpen: (open: boolean) => void;
};

const STORAGE_KEY = 'recurse_ui_store';

function loadPersisted(): Partial<UIState> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Partial<UIState>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function persist(state: UIState) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    // Only persist the serializable parts of state (exclude functions)
    const serializable = {
      theme: state.theme,
      leftSidebarOpen: state.leftSidebarOpen,
      rightSidebarOpen: state.rightSidebarOpen,
      chatOpen: state.chatOpen,
      contextOpen: state.contextOpen,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore storage failures (e.g., quota exceeded, private browsing)
  }
}

export const useUIStore = create<UIState>((set, get) => {
  const persisted = loadPersisted();
  
  return {
    // Default values, with persisted values taking precedence
    theme: persisted.theme ?? 'system',
    leftSidebarOpen: persisted.leftSidebarOpen ?? true,
    rightSidebarOpen: persisted.rightSidebarOpen ?? false,
    chatOpen: persisted.chatOpen ?? false,
    contextOpen: persisted.contextOpen ?? false,

    // Theme management
    setTheme: (theme) => {
      set((state) => {
        const next = { ...state, theme };
        persist(next);
        return next;
      });
    },

    // Sidebar states
    setLeftSidebarOpen: (open) => {
      set((state) => {
        const next = { ...state, leftSidebarOpen: open };
        persist(next);
        return next;
      });
    },

    setRightSidebarOpen: (open) => {
      set((state) => {
        const next = { ...state, rightSidebarOpen: open };
        persist(next);
        return next;
      });
    },

    setChatOpen: (open) => {
      set((state) => {
        const next = { ...state, chatOpen: open };
        persist(next);
        return next;
      });
    },

    setContextOpen: (open) => {
      set((state) => {
        const next = { ...state, contextOpen: open };
        persist(next);
        return next;
      });
    },
  };
});

