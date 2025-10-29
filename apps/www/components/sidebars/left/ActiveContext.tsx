import * as React from 'react';
import { Badge } from '@/components/ui/badge';

interface ActiveContextProps {
  activeItems: Array<{
    id: string;
    title: string;
    type: 'document' | 'section' | 'frame';
  }>;
  onItemClick: (itemId: string) => void;
}

export function ActiveContext({
  activeItems,
  onItemClick,
}: ActiveContextProps) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleItems = showAll ? activeItems : activeItems.slice(0, 6);

  return (
    <div className="mt-2">
      {visibleItems.length > 0 ? (
        <div className="-space-x-1 flex flex-wrap gap-y-1">
          {visibleItems.map((item) => (
            <button
              className="group"
              key={item.id}
              onClick={() => onItemClick(item.id)}
            >
              <Badge
                className="scale-90 cursor-pointer rounded-full text-xs transition-colors hover:bg-primary/10"
                variant="outline"
              >
                {item.title}
              </Badge>
            </button>
          ))}
          {activeItems.length > 6 && (
            <button className="group" onClick={() => setShowAll(!showAll)}>
              <Badge
                className="scale-90 cursor-pointer rounded-full border-dashed text-xs transition-colors hover:bg-accent/80"
                variant="outline"
              >
                {showAll ? 'Show less' : `+${activeItems.length - 6} more`}
              </Badge>
            </button>
          )}
        </div>
      ) : (
        <p className="px-2 py-1 text-sidebar-foreground/60 text-xs">
          No active items selected
        </p>
      )}
    </div>
  );
}
