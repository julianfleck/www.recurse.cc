'use client';

import { useUIStore } from '@recurse/ui/lib';
import { ChevronRight, HelpCircle } from 'lucide-react';
import type * as React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDemoApp } from '@/contexts/DemoAppContext';
import { useSession } from '@/contexts/SessionContext';
import { ChatSection } from './ChatSection';
import { ReferencesSection } from './ReferencesSection';

interface RightSidebarProps extends React.ComponentProps<'div'> {
  onChatToggle?: () => void;
  onContextToggle?: () => void;
}

export function RightSidebar({
  onChatToggle,
  onContextToggle,
  ...props
}: RightSidebarProps) {
  const { chatOpen, setChatOpen, contextOpen, setContextOpen } = useUIStore();
  const { messagesBySession } = useDemoApp();
  const { selectedSessionId } = useSession();
  const messages = messagesBySession[selectedSessionId || ''] || [];
  const hasMessages = messages.length > 0;

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden border-l bg-sidebar"
      {...props}
    >
      <TooltipProvider>
        {/* Ask Questions Section - Takes 50% when both open, full height when references collapsed */}
        <div
          className={`border-sidebar-border border-b opacity-60 transition-opacity hover:opacity-100 ${
            chatOpen && contextOpen
              ? 'flex-1'
              : chatOpen
                ? 'flex-1'
                : 'flex-shrink-0'
          } flex min-h-0 flex-col`}
        >
          <Collapsible
            className="flex h-full flex-col"
            onOpenChange={(open) => {
              setChatOpen(open);
              onChatToggle?.();
            }}
            open={chatOpen}
          >
            <div className="flex-shrink-0 p-3">
              <CollapsibleTrigger asChild>
                <button className="flex w-full cursor-pointer items-center justify-between rounded-md p-1 hover:bg-sidebar-accent/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sidebar-foreground text-xs uppercase tracking-wide">
                      Ask Questions
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 cursor-help text-sidebar-foreground/50 hover:text-sidebar-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent className="z-[110] max-w-xs" side="left">
                        <p>
                          Ask questions about your documents and get AI-powered
                          answers based on your active context.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <ChevronRight
                    className={`h-3 w-3 transition-transform duration-200 ${chatOpen ? 'rotate-90' : ''}`}
                  />
                </button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex min-h-0 flex-1 flex-col">
              <ChatSection />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Used References Section - Takes 50% when both open, full height when questions collapsed */}
        <div
          className={`opacity-60 transition-opacity hover:opacity-100 ${
            chatOpen && contextOpen
              ? 'flex-1'
              : contextOpen
                ? 'flex-1'
                : 'flex-shrink-0'
          } flex min-h-0 flex-col`}
        >
          <Collapsible
            className="flex h-full flex-col"
            onOpenChange={(open) => {
              setContextOpen(open);
              onContextToggle?.();
            }}
            open={contextOpen}
          >
            <div className="flex-shrink-0 p-3">
              <CollapsibleTrigger asChild>
                <button className="flex w-full cursor-pointer items-center justify-between rounded-md p-1 hover:bg-sidebar-accent/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sidebar-foreground text-xs uppercase tracking-wide">
                      {hasMessages ? 'Context' : 'Related'}
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 cursor-help text-sidebar-foreground/50 hover:text-sidebar-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent className="z-[110] max-w-xs" side="left">
                        <p>
                          {hasMessages
                            ? 'These are the documents, sections, and frames that were used as context to generate the answer.'
                            : 'These are the documents, sections, and frames that are contextually relevant to your current view.'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <ChevronRight
                    className={`h-3 w-3 transition-transform duration-200 ${contextOpen ? 'rotate-90' : ''}`}
                  />
                </button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex min-h-0 flex-1 flex-col">
              <ReferencesSection />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </TooltipProvider>
    </div>
  );
}
