'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DropzoneOverlayProps {
  message?: string;
  onDrop?: (files: File[]) => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  ringClassName?: string;
}

export function DropzoneOverlay({
  message = 'Drop files to upload',
  onDrop,
  children,
  className,
  overlayClassName,
  ringClassName,
}: DropzoneOverlayProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  // Global drag end handler for aborted drags
  React.useEffect(() => {
    const handleGlobalDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (onDrop && files.length > 0) {
        onDrop(files);
      }
    },
    [onDrop]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if we're leaving the dropzone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragEnd = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div
      className={cn(
        'relative',
        isDragging &&
          cn(
            'rounded-md ring-1 ring-accent/40 ring-inset [&>*:not(.dropzone-overlay)]:blur-[1px] [&>*:not(.dropzone-overlay)]:transition-all [&>*:not(.dropzone-overlay)]:duration-200',
            ringClassName
          ),
        className
      )}
      onDragEnd={handleDragEnd}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {isDragging && (
        <div
          className={cn(
            'dropzone-overlay pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-md bg-accent/10',
            overlayClassName
          )}
        >
          <div className="rounded-lg border border-border bg-background/95 p-4 shadow-lg">
            <p className="font-medium text-sm">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
