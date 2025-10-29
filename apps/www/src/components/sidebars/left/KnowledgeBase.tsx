import {
  CheckSquare,
  ChevronRight,
  Eye,
  MoreVertical,
  Square,
  Trash2,
} from 'lucide-react';
import { Fragment } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDemoApp } from '@/contexts/DemoAppContext';
import { useViewer } from '@/contexts/ViewerContext';
import { cn } from '@/lib/utils';

export type TreeItem = {
  id: string;
  title: string;
  type: string;
  inScope: boolean;
  sections?: TreeItem[];
  frames?: TreeItem[];
  isLoading?: boolean;
  loadingProgress?: number;
};

interface KnowledgeBaseProps {
  docs: TreeItem[];
  updateItemScope: (itemPath: string, newScope: boolean) => void;
  collapsibleStates: Record<string, boolean>;
  setCollapsibleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  onDeleteDocument?: (docId: string) => void;
}

function TreeRow({
  item,
  itemId,
  itemType,
  updateItemScope,
  onDelete,
  isOpen,
  onToggle,
  level = 0,
  hasChildren,
}: {
  item: TreeItem;
  itemId: string;
  itemType: 'document' | 'section' | 'frame';
  updateItemScope: (itemPath: string, newScope: boolean) => void;
  onDelete?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  level?: number;
  hasChildren?: boolean;
}) {
  const { selectItem, selectedItem } = useViewer();
  const { setCurrentStep } = useDemoApp();
  const isSelected = selectedItem?.id === itemId;

  return (
    <div
      className="group flex w-full min-w-0 items-center gap-x-2"
      data-item-id={itemId}
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-x-2"
        style={{ marginLeft: hasChildren ? level * 16 : level * 16 + 12 }}
      >
        {hasChildren && (
          <button
            aria-expanded={isOpen}
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent/50',
              item.isLoading && 'cursor-not-allowed opacity-30'
            )}
            disabled={item.isLoading}
            onClick={onToggle}
            type="button"
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                isOpen && 'rotate-90'
              )}
            />
          </button>
        )}
        <button
          className={cn(
            'min-w-0 flex-1 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-sidebar-accent/50',
            item.isLoading && 'cursor-not-allowed opacity-60',
            isSelected && 'bg-sidebar-accent/50 font-medium'
          )}
          disabled={item.isLoading}
          onClick={() => {
            if (!item.isLoading) {
              selectItem({ id: itemId, title: item.title, type: itemType });
              setCurrentStep('chat');
            }
          }}
          type="button"
        >
          <span
            className={cn(
              'block truncate text-sm',
              itemType === 'frame' && 'font-light'
            )}
          >
            {item.title}
          </span>
        </button>
      </div>
      <Checkbox
        checked={item.inScope}
        className="mr-2 ml-2 shrink-0"
        onCheckedChange={(checked) => updateItemScope(itemId, !!checked)}
        variant="outline"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-sidebar-accent/50 group-hover:opacity-100"
            type="button"
          >
            <MoreVertical className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-[100] w-56">
          <DropdownMenuItem
            className="text-xs"
            onClick={() => {
              selectItem({ id: itemId, title: item.title, type: itemType });
              setCurrentStep('chat');
            }}
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            Open {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs"
            onClick={() => updateItemScope(itemId, !item.inScope)}
          >
            {item.inScope ? (
              <>
                <Square className="mr-2 h-3.5 w-3.5" />
                Exclude from Context
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-3.5 w-3.5" />
                Include in Context
              </>
            )}
          </DropdownMenuItem>
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive text-xs focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Helper function to determine item type
function getItemType(
  parentType: string,
  hasFrames: boolean
): 'document' | 'section' | 'frame' {
  if (parentType === 'document') {
    return 'document';
  }
  if (hasFrames) {
    return 'frame';
  }
  return 'section';
}

// Helper function to get items safely
function getChildItems(item: TreeItem, hasSections: boolean): TreeItem[] {
  if (hasSections && item.sections) {
    return item.sections;
  }
  if (item.frames) {
    return item.frames;
  }
  return [];
}

function TreeItem({
  item,
  parentType,
  level,
  updateItemScope,
  collapsibleStates,
  setCollapsibleStates,
  onDeleteDocument,
}: {
  item: TreeItem;
  parentType: 'document' | 'section' | 'frame';
  level: number;
  updateItemScope: (itemPath: string, newScope: boolean) => void;
  collapsibleStates: Record<string, boolean>;
  setCollapsibleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  onDeleteDocument?: (docId: string) => void;
}) {
  const hasSections = Boolean(item.sections && item.sections.length > 0);
  const hasFrames = Boolean(item.frames && item.frames.length > 0);
  const hasChildren = hasSections || hasFrames;
  const itemType = getItemType(parentType, hasFrames);
  const itemId = `${itemType}-${item.id}`;
  const isOpen = collapsibleStates[itemId] ?? true;
  const onToggle = () =>
    setCollapsibleStates((prev) => ({ ...prev, [itemId]: !isOpen }));

  return (
    <Fragment key={itemId}>
      <TreeRow
        hasChildren={hasChildren}
        isOpen={hasChildren ? isOpen : undefined}
        item={item}
        itemId={itemId}
        itemType={itemType}
        level={level}
        onDelete={
          parentType === 'document' && onDeleteDocument
            ? () => onDeleteDocument(item.id)
            : undefined
        }
        onToggle={hasChildren ? onToggle : undefined}
        updateItemScope={updateItemScope}
      />
      {hasChildren && isOpen && (
        <Tree
          collapsibleStates={collapsibleStates}
          items={getChildItems(item, hasSections)}
          level={level + 1}
          onDeleteDocument={onDeleteDocument}
          parentType={hasSections ? 'section' : 'frame'}
          setCollapsibleStates={setCollapsibleStates}
          updateItemScope={updateItemScope}
        />
      )}
    </Fragment>
  );
}

function Tree({
  items,
  updateItemScope,
  collapsibleStates,
  setCollapsibleStates,
  onDeleteDocument,
  level = 0,
  parentType = 'document',
}: {
  items: TreeItem[];
  updateItemScope: (itemPath: string, newScope: boolean) => void;
  collapsibleStates: Record<string, boolean>;
  setCollapsibleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  onDeleteDocument?: (docId: string) => void;
  level?: number;
  parentType?: 'document' | 'section' | 'frame';
}) {
  return (
    <>
      {items.map((item) => (
        <TreeItem
          collapsibleStates={collapsibleStates}
          item={item}
          key={`${parentType}-${item.id}`}
          level={level}
          onDeleteDocument={onDeleteDocument}
          parentType={parentType}
          setCollapsibleStates={setCollapsibleStates}
          updateItemScope={updateItemScope}
        />
      ))}
    </>
  );
}

export function KnowledgeBase({
  docs,
  updateItemScope,
  collapsibleStates,
  setCollapsibleStates,
  onDeleteDocument,
}: KnowledgeBaseProps) {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <Tree
        collapsibleStates={collapsibleStates}
        items={docs}
        level={0}
        onDeleteDocument={onDeleteDocument}
        parentType="document"
        setCollapsibleStates={setCollapsibleStates}
        updateItemScope={updateItemScope}
      />
    </div>
  );
}
