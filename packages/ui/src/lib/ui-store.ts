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

// Get cookie domain - works across subdomains in production, localhost in dev
function getCookieDomain(): string {
  if (typeof window === 'undefined') {
    return '.recurse.cc';
  }
  const hostname = window.location.hostname;
  // In production, use .recurse.cc to share across subdomains
  if (hostname.includes('recurse.cc')) {
    return '.recurse.cc';
  }
  // In dev (localhost), cookies work without domain (or use empty string)
  return '';
}

// Cookie helpers for cross-subdomain synchronization
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') {
    return;
  }
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const domain = getCookieDomain();
  // Use domain=.recurse.cc in production to share across subdomains
  // In dev (localhost), use no domain (cookies work automatically)
  const domainPart = domain ? `;domain=${domain}` : '';

  // Security: Add Secure flag in production (HTTPS only)
  // Note: Secure flag requires HTTPS - don't set in localhost dev
  const isSecure =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'https:' ||
      window.location.hostname.includes('recurse.cc'));
  const securePart = isSecure ? ';Secure' : '';

  // Setting cookie requires direct assignment - this is the standard way to set cookies
  // Values are URL-encoded and validated, so this is safe
  // SameSite=Lax prevents CSRF attacks while allowing cross-subdomain sharing
  // NOTE: Biome warns about document.cookie assignment, but this is the standard API
  // and required for cross-subdomain synchronization. See ui-store.SECURITY.md for details.
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/${domainPart};SameSite=Lax${securePart}`;
  document.cookie = cookieString;
}

function loadPersisted(): Partial<UIState> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    // Try cookie first (cross-subdomain)
    const cookieValue = getCookie(STORAGE_KEY);
    if (cookieValue) {
      const parsed = JSON.parse(
        decodeURIComponent(cookieValue)
      ) as Partial<UIState>;
      return parsed ?? {};
    }
    // Fallback to localStorage (same-subdomain)
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
    // Security: Only persist safe, serializable UI state (never auth tokens, passwords, or PII)
    // Validate theme value to prevent injection
    const safeTheme =
      state.theme === 'light' ||
      state.theme === 'dark' ||
      state.theme === 'system'
        ? state.theme
        : 'system';

    const serializable = {
      theme: safeTheme,
      leftSidebarOpen: Boolean(state.leftSidebarOpen),
      rightSidebarOpen: Boolean(state.rightSidebarOpen),
      chatOpen: Boolean(state.chatOpen),
      contextOpen: Boolean(state.contextOpen),
    };
    const value = JSON.stringify(serializable);

    // Security: Check cookie size limit (~4KB) - our UI state should be <100 bytes
    if (value.length > 3000) {
      // Cookie too large - skip cookie persistence, use localStorage only
      // Still persist to localStorage
      window.localStorage.setItem(STORAGE_KEY, value);
      return;
    }

    // Persist to cookie for cross-subdomain sync (URL-encoded for safety)
    setCookie(STORAGE_KEY, encodeURIComponent(value));

    // Also persist to localStorage for same-subdomain tabs
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore storage failures (e.g., quota exceeded, private browsing)
  }
}

export const useUIStore = create<UIState>((set) => {
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

// Set up cross-tab and cross-subdomain synchronization
if (typeof window !== 'undefined') {
  // Listen for storage changes from other tabs/windows (same subdomain)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue) as Partial<UIState>;
        // Update Zustand store with new state from other tab
        useUIStore.setState(newState);
      } catch {
        // Ignore parse errors
      }
    }
  });

  // Poll for cookie changes (cross-subdomain sync)
  // Cookies don't fire storage events across subdomains, so we poll periodically
  let lastCookieValue: string | null = getCookie(STORAGE_KEY);
  const pollInterval = setInterval(() => {
    const currentCookie = getCookie(STORAGE_KEY);
    if (currentCookie !== lastCookieValue) {
      if (currentCookie) {
        try {
          const newState = JSON.parse(
            decodeURIComponent(currentCookie)
          ) as Partial<UIState>;
          // Only update if theme actually changed to avoid unnecessary re-renders
          const currentState = useUIStore.getState();
          if (newState.theme && newState.theme !== currentState.theme) {
            useUIStore.setState(newState);
          }
          lastCookieValue = currentCookie;
        } catch {
          // Ignore parse errors
        }
      } else {
        lastCookieValue = null;
      }
    }
  }, 500); // Check every 500ms for cross-subdomain changes

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(pollInterval);
  });
}
