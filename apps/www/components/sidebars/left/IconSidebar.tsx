import { useUIStore } from '@recurse/ui/lib';
import {
  Command,
  GitPullRequest,
  Menu,
  MessagesSquare,
  SquareLibrary,
} from 'lucide-react';
import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function IconSidebar({ ...props }: React.ComponentProps<'div'>) {
  const {
    leftSidebarOpen,
    setLeftSidebarOpen,
    chatOpen,
    setChatOpen,
    contextOpen,
    setContextOpen,
  } = useUIStore();
  const [graphOpen, setGraphOpen] = React.useState(false);

  const toggleItems = [
    {
      icon: Menu,
      tooltip: 'Show/hide navigation',
      isActive: leftSidebarOpen,
      onClick: () => setLeftSidebarOpen(!leftSidebarOpen),
    },
    {
      icon: MessagesSquare,
      tooltip: 'Show/hide chat',
      isActive: chatOpen,
      onClick: () => setChatOpen(!chatOpen),
    },
    {
      icon: SquareLibrary,
      tooltip: 'Show/hide context',
      isActive: contextOpen,
      onClick: () => setContextOpen(!contextOpen),
    },
    {
      icon: GitPullRequest,
      tooltip: 'Show/hide graph',
      isActive: graphOpen,
      onClick: () => setGraphOpen(!graphOpen),
      disabled: true, // Placeholder for now
    },
  ];

  return (
    <TooltipProvider>
      <div
        className="flex w-12 shrink-0 flex-col border-r bg-sidebar"
        {...props}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-center">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Command className="size-4" />
          </div>
        </div>

        {/* Toggle items */}
        <div className="flex-1 px-2 py-2">
          {toggleItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'mb-1 flex w-full items-center justify-center rounded-md p-2 transition-colors',
                    item.isActive &&
                      !item.disabled &&
                      'bg-sidebar-accent text-sidebar-accent-foreground',
                    !(item.isActive || item.disabled) &&
                      'text-muted-foreground hover:bg-sidebar-accent/50',
                    item.disabled && 'cursor-not-allowed opacity-50'
                  )}
                  disabled={item.disabled}
                  onClick={item.onClick}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
