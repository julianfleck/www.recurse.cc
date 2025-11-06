'use client';

import { Badge } from '@recurse/ui/components/badge';
import { Progress } from '@recurse/ui/components/progress';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  File,
  FileText,
  Upload,
} from 'lucide-react';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { useDemoApp } from '@/contexts/DemoAppContext';

const frameTypeIcons = {
  concept: Brain,
  fact: FileText,
  relationship: Database,
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle2;
    case 'processing':
      return Clock;
    case 'error':
      return AlertCircle;
    default:
      return File;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function FilesSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const {
    files,
    addFiles,
    selectedFiles,
    toggleFileSelection,
    setCurrentStep,
  } = useDemoApp();
  const [isDragging, setIsDragging] = React.useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      addFiles(acceptedFiles);
      setIsDragging(false);
    },
    onDragEnter: () => {
      setIsDragging(true);
    },
    onDragLeave: () => {
      setIsDragging(false);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/markdown': ['.md'],
    },
    noClick: false,
    multiple: true,
  });

  // Auto-advance to chat step when first file completes processing
  React.useEffect(() => {
    const hasCompletedFile = files.some((file) => file.status === 'completed');
    if (hasCompletedFile) {
      setCurrentStep('chat');
    }
  }, [files, setCurrentStep]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  const dropzoneHeight = files.length === 0 ? 'h-96' : 'h-16';
  const isDropzoneActive = isDragActive || isDragging;

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative mb-4 cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200 ${
                isDropzoneActive
                  ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              } ${dropzoneHeight} `}
            >
              <input {...getInputProps()} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="mb-1 text-muted-foreground text-sm">
                  {isDropzoneActive
                    ? 'Drop files here!'
                    : files.length === 0
                      ? 'Drop files here or click to browse'
                      : 'Drop more files or click to browse'}
                </p>
                <p className="text-muted-foreground text-xs">
                  Supports PDF, TXT, DOCX, MD files
                </p>
              </div>
              {isDropzoneActive && (
                <div className="absolute inset-0 animate-pulse rounded-lg bg-primary/10" />
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <SidebarMenu>
                {files.map((file) => {
                  const StatusIcon = getStatusIcon(file.status);

                  return (
                    <SidebarMenuItem key={file.id}>
                      <Collapsible
                        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                        defaultOpen={file.status === 'completed'}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="justify-between">
                            <div className="flex min-w-0 items-center gap-2">
                              <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform" />
                              <StatusIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate text-sm">
                                {file.name}
                              </span>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                              <Badge
                                className={`text-xs ${getStatusColor(file.status)}`}
                                variant="secondary"
                              >
                                {file.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Switch
                                  checked={selectedFiles.includes(file.id)}
                                  onCheckedChange={() =>
                                    toggleFileSelection(file.id)
                                  }
                                />
                              </div>
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="space-y-2 px-4 py-2">
                            <div className="text-muted-foreground text-xs">
                              {formatFileSize(file.size)}
                            </div>

                            {file.status === 'processing' && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Processing...</span>
                                  <span>{file.progress}%</span>
                                </div>
                                <Progress
                                  className="h-1"
                                  value={file.progress}
                                />
                              </div>
                            )}

                            {file.frames && file.frames.length > 0 && (
                              <SidebarMenuSub>
                                {file.frames.map((frame) => {
                                  const FrameIcon =
                                    frameTypeIcons[
                                      frame.type as keyof typeof frameTypeIcons
                                    ];

                                  return (
                                    <SidebarMenuItem key={frame.id}>
                                      <SidebarMenuButton
                                        className="justify-between"
                                        size="sm"
                                      >
                                        <div className="flex min-w-0 items-center gap-2">
                                          <FrameIcon className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate text-xs">
                                            {frame.title}
                                          </span>
                                        </div>
                                        <span className="flex-shrink-0 text-muted-foreground text-xs">
                                          {Math.round(frame.confidence * 100)}%
                                        </span>
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
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
