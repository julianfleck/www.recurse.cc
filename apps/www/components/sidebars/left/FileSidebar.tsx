import { ChevronRight, FileUp, HelpCircle, Plus } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DropzoneOverlay } from '@/components/ui/dropzone-overlay';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDemoApp } from '@/contexts/DemoAppContext';
import { useSession } from '@/contexts/SessionContext';
import { useViewer } from '@/contexts/ViewerContext';
import { api } from '@/services/apiConfig';
import { useUIStore } from '@recurse/ui/lib';
import { ActiveContext } from './ActiveContext';
import { KnowledgeBase, type TreeItem } from './KnowledgeBase';
import { RecentQueries } from './RecentQueries';

// Minimal types for API mapping - updated for new structure
interface ApiSection {
  id: string;
  title: string;
  type: string;
  summary?: string;
  index?: number;
  inScope?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApiDoc {
  id: string;
  title: string;
  summary?: string;
  inScope?: boolean;
  children?: ApiSection[];
  created_at?: string;
  updated_at?: string;
}

// Map API response to TreeItem[]
function mapApiDocsToTreeItems(apiDocs: ApiDoc[]): TreeItem[] {
  return apiDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    type: 'document',
    inScope: doc.inScope ?? true,
    sections: (doc.children || [])
      .slice() // copy to avoid mutating original
      .sort((a, b) => {
        if (typeof a.index === 'number' && typeof b.index === 'number') {
          return a.index - b.index;
        }
        if (typeof a.index === 'number') {
          return -1;
        }
        if (typeof b.index === 'number') {
          return 1;
        }
        return 0;
      })
      .map((section) => ({
        id: section.id,
        title: section.title,
        type: 'section',
        inScope: section.inScope ?? true,
        // No frames in the new structure - sections are leaf nodes
      })),
  }));
}

export function FileSidebar() {
  const [activeContextOpen, setActiveContextOpen] = React.useState(true);
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = React.useState(true);
  const [docs, setDocs] = React.useState<TreeItem[]>([]);
  const [collapsibleStates, setCollapsibleStates] = React.useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = React.useState(true);

  const {
    sessions,
    selectedSessionId,
    selectSession,
    createSession,
    deleteSession,
  } = useSession();
  const [recentQueriesOpen, setRecentQueriesOpen] = React.useState(
    sessions.length > 0
  );
  const { currentStep, setCurrentStep, deleteSessionMessages } = useDemoApp();
  const { setViewMode } = useViewer();
  const { setChatOpen } = useUIStore();

  React.useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const apiDocs = await api.getDocumentsWithChildren();
        setDocs(mapApiDocsToTreeItems(apiDocs as ApiDoc[]));
      } catch {
        setDocs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // Handle creating a new chat session
  const handleNewChat = React.useCallback(() => {
    // Create new session
    const newSessionId = createSession('New Chat');

    // Select the new session
    selectSession(newSessionId);

    // Switch to chat view
    setViewMode('chat');

    // Ensure we're on the chat tab
    if (currentStep !== 'chat') {
      setCurrentStep('chat');
    }

    // Open the chat sidebar
    setChatOpen(true);

    // Open Recent Queries if it's closed
    if (!recentQueriesOpen) {
      setRecentQueriesOpen(true);
    }

    // Focus the chat input after a short delay to ensure the UI has updated
    setTimeout(() => {
      const chatInput = document.querySelector(
        '[data-chat-input]'
      ) as HTMLTextAreaElement;
      if (chatInput) {
        chatInput.focus();
      }
    }, 200);
  }, [
    createSession,
    selectSession,
    setViewMode,
    setCurrentStep,
    currentStep,
    recentQueriesOpen,
    setChatOpen,
  ]);

  // Handle deleting a chat session and its messages
  const handleDeleteSession = React.useCallback(
    (sessionId: string) => {
      deleteSession(sessionId);
      deleteSessionMessages(sessionId);
    },
    [deleteSession, deleteSessionMessages]
  );

  // Function to update item scope with automatic parent-child synchronization
  const updateItemScope = (itemPath: string, newScope: boolean) => {
    setDocs((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData)); // Deep clone

      // Helper function to recursively update all children
      const updateAllChildren = (item: TreeItem, scope: boolean) => {
        item.inScope = scope;
        if (item.sections) {
          item.sections.forEach((section) => {
            updateAllChildren(section, scope);
          });
        }
        // No frames in the new structure
      };

      // Helper function to update parents based on children state
      const updateParentStates = () => {
        // Update documents based on their sections
        for (const doc of newData) {
          const hasSelectedSections =
            doc.sections?.some((section: TreeItem) => section.inScope) ?? false;

          if (doc.inScope !== hasSelectedSections) {
            doc.inScope = hasSelectedSections;
            // Auto-open parent when children are selected, auto-close when none selected
            setCollapsibleStates((prev) => ({
              ...prev,
              [`document-${doc.id}`]: hasSelectedSections,
            }));
          }
        }
      };

      // Update the specific item that was clicked
      if (itemPath.startsWith('document-')) {
        const docId = itemPath.replace('document-', '');
        const doc = newData.find((d: TreeItem) => d.id === docId);
        if (doc) {
          doc.inScope = newScope;
          // When selecting/deselecting a document, update all its children
          updateAllChildren(doc, newScope);
        }
      } else if (itemPath.startsWith('section-')) {
        const sectionId = itemPath.replace('section-', '');
        for (const doc of newData) {
          const section = doc.sections?.find(
            (s: TreeItem) => s.id === sectionId
          );
          if (section) {
            section.inScope = newScope;
            // Sections are leaf nodes in the new structure
            break;
          }
        }
      }

      // Always update parent states based on children
      updateParentStates();

      return newData;
    });
  };

  // Get all active (in-scope) items for badges
  const getActiveItems = () => {
    const activeItems: Array<{
      id: string;
      title: string;
      type: 'document' | 'section' | 'frame';
    }> = [];

    // Add active documents
    docs.forEach((doc) => {
      if (doc.inScope) {
        activeItems.push({
          id: `document-${doc.id}`,
          title: doc.title,
          type: 'document',
        });
      }

      // Add active sections
      doc.sections?.forEach((section) => {
        if (section.inScope) {
          activeItems.push({
            id: `section-${section.id}`,
            title: section.title,
            type: 'section',
          });
        }
      });
    });

    return activeItems;
  };

  const scrollToKnowledgeBaseItem = (itemId: string) => {
    // Ensure Knowledge Base is open
    setKnowledgeBaseOpen(true);

    // Helper function to ensure all parent collapsibles are expanded
    const expandParentsForItem = (targetId: string) => {
      if (targetId.startsWith('document-')) {
        const docId = targetId.replace('document-', '');
        setCollapsibleStates((prev) => ({
          ...prev,
          [`document-${docId}`]: true,
        }));
      } else if (targetId.startsWith('section-')) {
        const sectionId = targetId.replace('section-', '');
        // Find the parent document for this section
        for (const doc of docs) {
          const section = doc.sections?.find(
            (s: TreeItem) => s.id === sectionId
          );
          if (section) {
            setCollapsibleStates((prev) => ({
              ...prev,
              [`document-${doc.id}`]: true,
            }));
            break;
          }
        }
      }
    };

    // Expand all parent sections first
    expandParentsForItem(itemId);

    // Use setTimeout to ensure the collapsible content is rendered
    setTimeout(() => {
      // Find the scrollable container (Knowledge Base content area)
      const scrollContainer = document.querySelector(
        '[data-knowledge-base-scroll]'
      );
      // Find the target element
      const targetElement = document.querySelector(
        `[data-item-id="${itemId}"]`
      );

      if (scrollContainer && targetElement) {
        // Get the position of the target element relative to the scroll container
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const relativeTop =
          targetRect.top - containerRect.top + scrollContainer.scrollTop;

        // Scroll to position the target at the top of the scroll container
        scrollContainer.scrollTo({
          top: relativeTop,
          behavior: 'smooth',
        });

        // Add pulsing highlight effect
        targetElement.classList.add('animate-pulse', 'bg-accent/30');
        setTimeout(() => {
          targetElement.classList.remove('animate-pulse', 'bg-accent/30');
          targetElement.classList.add('bg-accent/10');
          setTimeout(() => {
            targetElement.classList.remove('bg-accent/10');
          }, 1000);
        }, 1000);
      }
    }, 150);
  };

  const activeItems = getActiveItems();

  // Handle file drop
  const handleFileDrop = React.useCallback((files: File[]) => {
    // Add new documents for each dropped file
    files.forEach((file) => {
      const docId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `doc-${file.name}-${Date.now()}`;
      const newDoc: TreeItem = {
        id: docId,
        title: file.name,
        type: 'document',
        inScope: false,
        isLoading: true,
        loadingProgress: 0,
        sections: [],
      };
      setDocs((prev) => [...prev, newDoc]);
      setKnowledgeBaseOpen(true);
      setTimeout(() => {
        const newDocElement = document.querySelector(
          `[data-item-id="document-${docId}"]`
        );
        if (newDocElement) {
          const scrollContainer = document.querySelector(
            '[data-knowledge-base-scroll]'
          );
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = newDocElement.getBoundingClientRect();
            const relativeTop =
              elementRect.top - containerRect.top + scrollContainer.scrollTop;
            scrollContainer.scrollTo({
              top: relativeTop,
              behavior: 'smooth',
            });
            newDocElement.classList.add('bg-accent/20');
            setTimeout(() => {
              newDocElement.classList.remove('bg-accent/20');
              newDocElement.classList.add('transition-colors', 'duration-500');
              setTimeout(() => {
                newDocElement.classList.remove(
                  'transition-colors',
                  'duration-500'
                );
              }, 500);
            }, 1000);
          }
        }
      }, 100);
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setDocs((prev) =>
            prev.map((doc) =>
              doc.id === docId
                ? {
                    ...doc,
                    isLoading: false,
                    loadingProgress: undefined,
                    inScope: true,
                    sections: [
                      {
                        id: `${docId}-section-1`,
                        title: 'Introduction',
                        type: 'section',
                        inScope: true,
                        frames: [],
                      },
                    ],
                  }
                : doc
            )
          );
        } else {
          setDocs((prev) =>
            prev.map((doc) =>
              doc.id === docId ? { ...doc, loadingProgress: progress } : doc
            )
          );
        }
      }, 500);
    });
  }, []);

  // Handle document deletion
  const handleDeleteDocument = React.useCallback((docId: string) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== docId));
  }, []);

  return (
    <DropzoneOverlay
      className="flex min-w-0 flex-1 flex-col overflow-hidden overflow-x-hidden bg-sidebar"
      onDrop={handleFileDrop}
    >
      {isLoading ? (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-x-hidden p-8 text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h3 className="mb-2 font-medium text-sm">Loading documents...</h3>
          <p className="text-muted-foreground text-xs">
            Fetching your knowledge base
          </p>
        </div>
      ) : docs.length === 0 ? (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-x-hidden p-8 text-center">
          <FileUp
            className="mb-4 h-12 w-12 text-muted-foreground"
            strokeWidth={0.8}
          />
          <h3 className="mb-2 font-medium text-sm">No documents yet</h3>
          <p className="mb-4 text-muted-foreground text-xs">
            Drag and drop files here to start building your knowledge base
          </p>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {/* Active Context Section */}
          <div className="min-w-0 flex-shrink-0 overflow-x-hidden border-sidebar-border border-b p-3 opacity-60 transition-opacity hover:opacity-100">
            <Collapsible
              onOpenChange={setActiveContextOpen}
              open={activeContextOpen}
            >
              <CollapsibleTrigger asChild>
                <button className="flex w-full min-w-0 cursor-pointer items-center justify-between rounded-md p-1 hover:bg-sidebar-accent/50">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="min-w-0 overflow-hidden truncate whitespace-nowrap font-medium text-sidebar-foreground text-xs uppercase tracking-wide">
                      Active Context
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 cursor-help text-sidebar-foreground/50 hover:text-sidebar-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent className="z-[110] max-w-xs" side="right">
                        <p>
                          This is the context that gets sent to the AI model in
                          order to answer your questions. Only checked items
                          will be included.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge className="rounded-full text-xs" variant="secondary">
                      {activeItems.length}
                    </Badge>
                    <ChevronRight
                      className={`h-3 w-3 transition-transform duration-200 ${activeContextOpen ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ActiveContext
                  activeItems={activeItems}
                  onItemClick={scrollToKnowledgeBaseItem}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
          {/* Knowledge Base Section */}
          <div
            className={`border-sidebar-border border-b opacity-60 transition-opacity hover:opacity-100 ${knowledgeBaseOpen ? 'flex-1' : 'flex-shrink-0'} flex min-h-0 min-w-0 flex-col overflow-x-hidden`}
          >
            <Collapsible
              className="flex h-full min-w-0 flex-col overflow-x-hidden"
              onOpenChange={setKnowledgeBaseOpen}
              open={knowledgeBaseOpen}
            >
              <div className="min-w-0 flex-shrink-0 overflow-x-hidden p-3">
                <CollapsibleTrigger asChild>
                  <button className="flex w-full min-w-0 cursor-pointer items-center justify-between rounded-md p-1 hover:bg-sidebar-accent/50">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="min-w-0 overflow-hidden truncate whitespace-nowrap font-medium text-sidebar-foreground text-xs uppercase tracking-wide">
                        Knowledge Base
                      </h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 cursor-help text-sidebar-foreground/50 hover:text-sidebar-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent
                          className="z-[110] max-w-xs"
                          side="right"
                        >
                          <p>
                            This is your complete knowledge repository. Browse
                            and select documents, sections, and frames to
                            include in your active context.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <ChevronRight
                      className={`h-3 w-3 transition-transform duration-200 ${knowledgeBaseOpen ? 'rotate-90' : ''}`}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
                <div
                  className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3"
                  data-knowledge-base-scroll
                >
                  <KnowledgeBase
                    collapsibleStates={collapsibleStates}
                    docs={docs}
                    onDeleteDocument={handleDeleteDocument}
                    setCollapsibleStates={setCollapsibleStates}
                    updateItemScope={updateItemScope}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          {/* Recent Queries Section */}
          <div className="flex max-h-[150px] min-w-0 flex-shrink-0 flex-col overflow-x-hidden opacity-60 transition-opacity hover:opacity-100">
            <Collapsible
              className="flex min-h-0 min-w-0 flex-col overflow-x-hidden"
              onOpenChange={setRecentQueriesOpen}
              open={recentQueriesOpen}
            >
              <div className="min-w-0 flex-shrink-0 overflow-x-hidden p-3">
                <div className="flex min-w-0 items-center justify-between overflow-x-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="flex min-w-0 flex-1 cursor-pointer items-center justify-between overflow-x-hidden rounded-md p-1 hover:bg-sidebar-accent/50">
                      <h3 className="min-w-0 overflow-hidden truncate whitespace-nowrap font-medium text-sidebar-foreground text-xs uppercase tracking-wide">
                        Recent Queries
                      </h3>
                      <ChevronRight
                        className={`h-3 w-3 transition-transform duration-200 ${recentQueriesOpen ? 'rotate-90' : ''}`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="ml-1 rounded-md p-1 transition-colors hover:bg-sidebar-accent"
                        onClick={handleNewChat}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="z-[110]" side="top">
                      <p>Start new chat</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <CollapsibleContent className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden overflow-x-hidden">
                <div className="scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3">
                  <RecentQueries
                    onCreateNewChat={handleNewChat}
                    onDeleteSession={handleDeleteSession}
                    onSessionSelect={selectSession}
                    selectedSessionId={selectedSessionId || undefined}
                    sessions={sessions}
                  />
                </div>
                {/* Fade effect at bottom when scrollable */}
                <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-6 min-w-0 overflow-x-hidden bg-gradient-to-t from-sidebar to-transparent opacity-60" />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}
    </DropzoneOverlay>
  );
}
