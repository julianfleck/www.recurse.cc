'use client';

import { Badge } from '@recurse/ui/components/badge';
import { Brain, Lightbulb, Link, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useDemoApp } from '@/contexts/DemoAppContext';

export function FramesSidebar() {
  const { frames, files } = useDemoApp();

  const getFrameIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'concept':
        return <Brain className="h-4 w-4 text-blue-500" />;
      case 'entity':
        return <User className="h-4 w-4 text-green-500" />;
      case 'relationship':
        return <Link className="h-4 w-4 text-purple-500" />;
      default:
        return <Brain className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFrameTypeColor = (type: string) => {
    const colors = {
      claim:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      concept: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      entity:
        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      relationship:
        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    };
    return (
      colors[type as keyof typeof colors] ||
      'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    );
  };

  const getSourceFileName = (sourceFileId: string) => {
    const file = files.find((f) => f.id === sourceFileId);
    return file?.name || 'Unknown file';
  };

  return (
    <div className="flex h-full w-80 flex-col border-border border-l bg-muted/30">
      <div className="border-border border-b p-4">
        <h3 className="font-semibold text-lg">Extracted Frames</h3>
        <p className="text-muted-foreground text-sm">
          {frames.length} frame{frames.length !== 1 ? 's' : ''} extracted
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {frames.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Brain className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>No frames extracted yet</p>
            <p className="mt-1 text-xs">
              Upload and process documents to see extracted knowledge
            </p>
          </div>
        ) : (
          frames.map((frame) => (
            <Card className="bg-background" key={frame.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center space-x-2">
                    {getFrameIcon(frame.type)}
                    <h4
                      className="truncate font-medium text-sm"
                      title={frame.title}
                    >
                      {frame.title}
                    </h4>
                  </div>
                  <Badge
                    className={getFrameTypeColor(frame.type)}
                    variant="secondary"
                  >
                    {frame.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="line-clamp-3 text-muted-foreground text-sm">
                  {frame.content}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span
                    className="flex-1 truncate text-muted-foreground"
                    title={getSourceFileName(frame.sourceFileId)}
                  >
                    From: {getSourceFileName(frame.sourceFileId)}
                  </span>
                  <div className="ml-2 flex items-center space-x-1">
                    <div className="h-2 w-2 rounded-full bg-primary opacity-60" />
                    <span className="text-muted-foreground">
                      {Math.round(frame.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
