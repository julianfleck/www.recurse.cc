import type * as React from 'react';
import { FileSidebar } from './FileSidebar';

export function LeftSidebar({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className="flex h-full w-full overflow-hidden border-r bg-sidebar"
      {...props}
    >
      <FileSidebar />
    </div>
  );
}
