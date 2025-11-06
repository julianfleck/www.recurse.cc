'use client';

import { Badge } from '@recurse/ui/components/badge';
import { Box, FileText, Hash, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/services/apiConfig';

interface ViewerItem {
  id: string;
  title: string;
  type: 'document' | 'section' | 'frame';
  content?: string;
}

interface TextViewerProps {
  item: ViewerItem | null;
}

// Simple markdown parser using shadcn/ui typography styles
function renderMarkdown(markdown: string) {
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let elementIndex = 0;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const listKey = `list-${elementIndex++}`;
      if (listType === 'ul') {
        elements.push(
          <ul className="my-6 ml-6 list-disc [&>li]:mt-2" key={listKey}>
            {currentList.map((item, i) => (
              <li key={`${listKey}-item-${i}`}>{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" key={listKey}>
            {currentList.map((item, i) => (
              <li key={`${listKey}-item-${i}`}>{item}</li>
            ))}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((line) => {
    // Headers
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1
          className="scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl"
          key={`h1-${elementIndex++}`}
        >
          {line.substring(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2
          className="mt-10 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0"
          key={`h2-${elementIndex++}`}
        >
          {line.substring(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3
          className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight"
          key={`h3-${elementIndex++}`}
        >
          {line.substring(4)}
        </h3>
      );
    }
    // Lists
    else if (line.match(/^[-*]\s+/)) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(line.replace(/^[-*]\s+/, ''));
    } else if (line.match(/^\d+\.\s+/)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(line.replace(/^\d+\.\s+/, ''));
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          className="mt-6 border-l-2 pl-6 italic"
          key={`blockquote-${elementIndex++}`}
        >
          {line.substring(2)}
        </blockquote>
      );
    }
    // Paragraph
    else if (line.trim()) {
      flushList();
      // Process inline formatting
      let text = line;
      // Bold
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

      elements.push(
        <p
          className="leading-7 [&:not(:first-child)]:mt-6"
          dangerouslySetInnerHTML={{ __html: text }}
          key={`p-${elementIndex++}`}
        />
      );
    }
  });

  flushList();
  return <>{elements}</>;
}

export function TextViewer({ item }: TextViewerProps) {
  const [content, setContent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'summary' | 'full'>('summary');

  // Mock markdown content - fallback if API doesn't have content
  const getMockContent = React.useCallback((item: ViewerItem) => {
    if (item.type === 'document') {
      return `# ${item.title}

## Introduction

This is the introduction section of the document. It provides an overview of the main topics covered.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Methodology

This section describes the methodology used in the research or analysis.

- Data collection process
- Analysis techniques
- Tools and frameworks used

### Data Sources

We collected data from various sources including:

1. Primary research
2. Secondary sources
3. Expert interviews

## Results

The results section presents the key findings from our analysis.

### Key Findings

- Finding 1: Lorem ipsum dolor sit amet
- Finding 2: Consectetur adipiscing elit
- Finding 3: Sed do eiusmod tempor incididunt

## Conclusion

This document provides a comprehensive overview of the research conducted. The findings demonstrate the importance of proper methodology and data analysis.

## References

1. Reference 1
2. Reference 2
3. Reference 3
`;
    }
    if (item.type === 'section') {
      return `# ${item.title}

This is a section within a larger document. It contains specific information about a particular topic.

## Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Key Points

- Point 1: Important information
- Point 2: Additional details
- Point 3: Further analysis

## Summary

This section provides valuable insights into the topic at hand.
`;
    }
    if (item.type === 'frame') {
      return `# ${item.title}

This is a frame or specific view of content. It represents a particular perspective or subset of information.

## Frame Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

### Details

- Detail 1
- Detail 2
- Detail 3

## Context

This frame is part of a larger document structure and provides focused information.
`;
    }
    return `# ${item.title}

No content available for this item.
`;
  }, []);

  React.useEffect(() => {
    if (item) {
      setIsLoading(true);

      // Extract the raw ID from the prefixed ID
      // KnowledgeBase sends IDs like "document-doc-1", "section-sec-1-1", "frame-frame-1-1-1"
      // We need to extract the actual ID part for the API call
      let apiId = item.id;
      if (item.id.startsWith('document-')) {
        apiId = item.id.replace('document-', '');
      } else if (item.id.startsWith('section-')) {
        apiId = item.id.replace('section-', '');
      } else if (item.id.startsWith('frame-')) {
        apiId = item.id.replace('frame-', '');
      }

      api
        .getMarkdownContent(apiId)
        .then((fetchedContent) => {
          setContent(fetchedContent || getMockContent(item));
          setIsLoading(false);
        })
        .catch(() => {
          setContent(getMockContent(item));
          setIsLoading(false);
        });
    }
  }, [item, getMockContent]);

  // Generate a summary from the full content
  const generateSummary = (fullContent: string): string => {
    const lines = fullContent.split('\n').filter((line) => line.trim());
    const summaryLines: string[] = [];

    // Extract title
    const title = lines.find((line) => line.startsWith('# '));
    if (title) {
      summaryLines.push(title);
    }

    // Extract first paragraph after introduction
    const introIndex = lines.findIndex((line) =>
      line.toLowerCase().includes('introduction')
    );
    if (introIndex !== -1 && introIndex + 1 < lines.length) {
      summaryLines.push('\n## Overview');
      summaryLines.push(lines[introIndex + 1]);
    }

    // Extract key points or findings
    const keyPointsIndex = lines.findIndex(
      (line) =>
        line.toLowerCase().includes('key') &&
        (line.toLowerCase().includes('finding') ||
          line.toLowerCase().includes('point'))
    );
    if (keyPointsIndex !== -1) {
      summaryLines.push('\n## Key Points');
      // Get the next few bullet points
      for (
        let i = keyPointsIndex + 1;
        i < lines.length && i < keyPointsIndex + 4;
        i++
      ) {
        if (
          lines[i].startsWith('-') ||
          lines[i].startsWith('*') ||
          lines[i].match(/^\d+\./)
        ) {
          summaryLines.push(lines[i]);
        } else if (!lines[i].startsWith('#')) {
          break;
        }
      }
    }

    // Add a note that this is a summary
    summaryLines.push('\n---');
    summaryLines.push(
      '*This is an AI-generated summary. View "Full Text" for complete content.*'
    );

    return summaryLines.join('\n');
  };

  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-2 text-lg">No content selected</p>
          <p className="text-sm">
            Select a document, section, or frame from the Knowledge Base to view
            its content
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getIcon = () => {
    switch (item.type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'section':
        return <Hash className="h-4 w-4" />;
      case 'frame':
        return <Box className="h-4 w-4" />;
    }
  };

  return (
    <Tabs
      className="flex h-full flex-1 flex-col"
      onValueChange={(value) => setViewMode(value as 'summary' | 'full')}
      value={viewMode}
    >
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6">
        {/* Left side - Title */}
        <div className="flex items-center gap-2">
          {getIcon()}
          <h1 className="font-semibold">{item.title}</h1>
        </div>

        {/* Right side - Badge and Tab navigation */}
        <div className="flex items-center gap-3">
          <Badge className="capitalize" variant="secondary">
            {item.type}
          </Badge>
          <TabsList className="h-10 rounded-md bg-muted p-1">
            <TabsTrigger className="text-xs" value="summary">
              Summary
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="full">
              Full Text
            </TabsTrigger>
          </TabsList>
        </div>
      </header>

      {/* Content areas */}
      <TabsContent
        className="m-0 flex-1 overflow-auto px-8 py-8"
        value="summary"
      >
        <div className="max-w-2xl">
          {content && renderMarkdown(generateSummary(content))}
        </div>
      </TabsContent>

      <TabsContent className="m-0 flex-1 overflow-auto px-8 py-8" value="full">
        <div className="max-w-2xl">{content && renderMarkdown(content)}</div>
      </TabsContent>
    </Tabs>
  );
}
