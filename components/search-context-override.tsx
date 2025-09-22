"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Override Fumadocs search context to prevent it from opening
const SearchContext = createContext({
  enabled: false,
  open: false,
  setOpenSearch: () => {},
  hotKey: [],
});

export function useSearchContext() {
  return useContext(SearchContext);
}

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [open, setOpen] = useState(false);

  return (
    <SearchContext.Provider
      value={{
        enabled: false,
        open,
        setOpenSearch: () => {}, // Do nothing
        hotKey: [],
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
