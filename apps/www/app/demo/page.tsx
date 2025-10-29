'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';
import { DemoLayout } from '@/components/demo/DemoLayout';
import { FileUpload } from '@/components/demo/FileUpload';
import { TextViewer } from '@/components/demo/TextViewer';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DemoAppProvider, useDemoApp } from '@/contexts/DemoAppContext';
import { SessionProvider, useSession } from '@/contexts/SessionContext';
import { useViewer, ViewerProvider } from '@/contexts/ViewerContext';

// Component to sync session selection between contexts
function SessionSync() {
  const { selectedSessionId } = useSession();
  const { setCurrentSessionId } = useDemoApp();

  React.useEffect(() => {
    if (selectedSessionId) {
      setCurrentSessionId(selectedSessionId);
    }
  }, [selectedSessionId, setCurrentSessionId]);

  return null;
}

function DemoContent() {
  const { currentStep, setCurrentStep } = useDemoApp();
  const { selectedItem, isLoading } = useViewer();

  return (
    <>
      <SessionSync />
      <DemoLayout>
        <Tabs
          className="flex h-full flex-col"
          onValueChange={(value) => setCurrentStep(value as 'upload' | 'chat')}
          value={currentStep}
        >
          <TabsContent className="m-0 flex-1 overflow-auto p-6" value="upload">
            <FileUpload />
          </TabsContent>
          <TabsContent className="m-0 flex-1 overflow-hidden" value="chat">
            {isLoading ? (
              <div className="flex h-full flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedItem ? (
              <TextViewer item={selectedItem} />
            ) : (
              <div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
                <div className="max-w-md text-center">
                  <h2 className="mb-2 font-semibold text-lg">
                    Welcome to Recurse
                  </h2>
                  <p className="mb-4 text-sm">
                    Select a document, section, or frame from the Knowledge Base
                    to view its content, or ask questions in the chat panel on
                    the right.
                  </p>
                  <p className="text-xs">
                    Tip: You can also drag and drop files onto the left sidebar
                    to add them to your knowledge base.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DemoLayout>
    </>
  );
}

export default function DemoPage() {
  return (
    <div className="h-screen overflow-hidden">
      <DemoAppProvider>
        <SessionProvider>
          <ViewerProvider>
            <DemoContent />
          </ViewerProvider>
        </SessionProvider>
      </DemoAppProvider>
    </div>
  );
}
