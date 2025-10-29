import * as React from 'react';

export interface ViewerItem {
  id: string;
  title: string;
  type: 'document' | 'section' | 'frame';
  content?: string;
}

interface ViewerContextType {
  viewMode: 'chat' | 'viewer';
  setViewMode: (mode: 'chat' | 'viewer') => void;
  selectedItem: ViewerItem | null;
  selectItem: (item: ViewerItem | null) => void;
  isLoading: boolean;
}

const ViewerContext = React.createContext<ViewerContextType | undefined>(
  undefined
);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeInternal] = React.useState<'chat' | 'viewer'>(
    'chat'
  );
  const [selectedItem, setSelectedItem] = React.useState<ViewerItem | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const setViewMode = React.useCallback(
    (mode: 'chat' | 'viewer') => {
      if (mode !== viewMode) {
        setIsLoading(true);
        setTimeout(() => {
          setViewModeInternal(mode);
          setIsLoading(false);
        }, 200);
      }
    },
    [viewMode]
  );

  const selectItem = React.useCallback((item: ViewerItem | null) => {
    setIsLoading(true);
    setSelectedItem(item);
    if (item) {
      setTimeout(() => {
        setViewModeInternal('viewer');
        setIsLoading(false);
      }, 200);
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <ViewerContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedItem,
        selectItem,
        isLoading,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = React.useContext(ViewerContext);
  if (context === undefined) {
    throw new Error('useViewer must be used within a ViewerProvider');
  }
  return context;
}
