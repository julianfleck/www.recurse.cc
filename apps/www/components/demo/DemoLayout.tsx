import * as React from 'react';
import { ApiModeToggle } from '@/components/common/ApiModeToggle';
import { IconSidebar } from '@/components/sidebars/left/IconSidebar';
import { LeftSidebar } from '@/components/sidebars/left/LeftSidebar';
import { RightSidebar } from '@/components/sidebars/right/RightSidebar';
import { useDemoApp } from '@/contexts/DemoAppContext';
import { useSession } from '@/contexts/SessionContext';
import { useViewer } from '@/contexts/ViewerContext';
import { cn } from '@/lib/utils';
import { useUIStore } from '@recurse/ui/lib';

interface DemoLayoutProps {
  children: React.ReactNode;
}

export function DemoLayout({ children }: DemoLayoutProps) {
  const {
    leftSidebarOpen,
    chatOpen,
    contextOpen,
    setChatOpen,
    setContextOpen,
  } = useUIStore();

  // Get state from contexts
  const { messagesBySession } = useDemoApp();
  const { selectedSessionId } = useSession();
  const { selectedItem } = useViewer();

  // Check if there are any messages in the current session
  const hasMessages =
    selectedSessionId && messagesBySession[selectedSessionId]?.length > 0;

  // Check if any document/section/frame is selected in viewer
  const hasSelectedItem = !!selectedItem;

  // Track if user has manually interacted with accordions
  const [chatManuallyToggled, setChatManuallyToggled] = React.useState(false);
  const [contextManuallyToggled, setContextManuallyToggled] =
    React.useState(false);

  // Auto-open chat when there are messages (only if not manually closed)
  React.useEffect(() => {
    if (hasMessages && !chatOpen && !chatManuallyToggled) {
      setChatOpen(true);
    }
  }, [hasMessages, chatOpen, setChatOpen, chatManuallyToggled]);

  // Auto-open context when item is selected (only if not manually closed)
  React.useEffect(() => {
    if (hasSelectedItem && !contextOpen && !contextManuallyToggled) {
      setContextOpen(true);
    }
  }, [hasSelectedItem, contextOpen, setContextOpen, contextManuallyToggled]);

  // Reset manual toggle flags when content is removed
  React.useEffect(() => {
    if (!hasMessages) {
      setChatManuallyToggled(false);
    }
  }, [hasMessages]);

  React.useEffect(() => {
    if (!hasSelectedItem) {
      setContextManuallyToggled(false);
    }
  }, [hasSelectedItem]);

  // Show right sidebar if either accordion is open
  const rightSidebarVisible = chatOpen || contextOpen;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Icon Sidebar - Always visible */}
      <IconSidebar />

      {/* Left Sidebar - 1/4 width when open */}
      <div
        className={cn(
          'h-full flex-shrink-0 transition-all duration-300',
          leftSidebarOpen ? 'w-1/4' : 'w-0'
        )}
      >
        <div className={cn('h-full w-full', !leftSidebarOpen && 'invisible')}>
          <LeftSidebar />
        </div>
      </div>

      {/* Main Content - 2/4 width (flex-1 will expand to fill available space) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar with API Toggle */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <h2 className="font-semibold text-lg">Demo Application</h2>
            <ApiModeToggle />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Right Sidebar - 1/4 width when visible */}
      <div
        className={cn(
          'h-full flex-shrink-0 transition-all duration-300',
          rightSidebarVisible ? 'w-1/4' : 'w-0'
        )}
      >
        <div
          className={cn('h-full w-full', !rightSidebarVisible && 'invisible')}
        >
          <RightSidebar
            onChatToggle={() => setChatManuallyToggled(true)}
            onContextToggle={() => setContextManuallyToggled(true)}
          />
        </div>
      </div>
    </div>
  );
}
