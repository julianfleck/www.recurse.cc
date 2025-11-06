'use client';

import { Badge } from '@recurse/ui/components/badge';
import { Brain, Database, FileText, Lightbulb } from 'lucide-react';
import type * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useDemoApp } from '@/contexts/DemoAppContext';

const frameTypeIcons = {
  concept: Brain,
  fact: FileText,
  relationship: Database,
  claim: Lightbulb,
  entity: FileText,
};

const getFrameTypeColor = (type: string) => {
  switch (type) {
    case 'concept':
      return 'bg-blue-100 text-blue-800';
    case 'fact':
      return 'bg-green-100 text-green-800';
    case 'relationship':
      return 'bg-purple-100 text-purple-800';
    case 'claim':
      return 'bg-yellow-100 text-yellow-800';
    case 'entity':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function FramesSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { frames, files, selectedFiles, currentStep } = useDemoApp();

  // Only show frames from selected files
  const selectedFrames = frames.filter((frame) =>
    selectedFiles.includes(frame.sourceFileId)
  );

  const getSourceFileName = (sourceFileId: string) => {
    const file = files.find((f) => f.id === sourceFileId);
    return file ? file.name : 'Unknown';
  };

  if (currentStep !== 'chat') {
    return null;
  }

  return (
    <Sidebar side="right" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Retrieved Frames</SidebarGroupLabel>
          <SidebarGroupContent>
            {selectedFrames.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Select files to see retrieved frames
              </div>
            ) : (
              <SidebarMenu>
                {selectedFrames.map((frame) => {
                  const FrameIcon =
                    frameTypeIcons[frame.type as keyof typeof frameTypeIcons];

                  return (
                    <SidebarMenuItem key={frame.id}>
                      <SidebarMenuButton className="h-auto flex-col items-start p-3 hover:bg-accent">
                        <div className="mb-2 flex w-full items-center gap-2">
                          <FrameIcon className="h-4 w-4 flex-shrink-0" />
                          <Badge
                            className={`text-xs ${getFrameTypeColor(frame.type)}`}
                            variant="secondary"
                          >
                            {frame.type}
                          </Badge>
                          <span className="ml-auto text-muted-foreground text-xs">
                            {Math.round(frame.confidence * 100)}%
                          </span>
                        </div>

                        <div className="w-full text-left">
                          <h4 className="mb-1 line-clamp-2 font-medium text-sm">
                            {frame.title}
                          </h4>
                          <p className="mb-2 line-clamp-3 text-muted-foreground text-xs">
                            {frame.content}
                          </p>
                          <div className="text-muted-foreground text-xs">
                            From: {getSourceFileName(frame.sourceFileId)}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
