"use client";

import { BookOpen, Brain, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiError, apiService } from "@/lib/api";
import { cn } from "@/lib/utils";

const HIGHLIGHT_DURATION_MS = 1600;

type AnswerSource = {
  id: string;
  title?: string;
  type?: string;
  summary?: string;
  citation_index?: number;
  document_title?: string;
  document_summary?: string;
};

type AnswerResponse = {
  result?: string;
  versions?: string[];
  sources?: AnswerSource[];
  message?: string;
};

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [useKb, setUseKb] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<AnswerSource[] | null>(null);
  const [versions, setVersions] = useState<string[] | null>(null);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sourceRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [highlightedSource, setHighlightedSource] = useState<number | null>(
    null
  );

  const hasContent = useMemo(() => {
    return Boolean(answer) || (Array.isArray(versions) && versions.length > 0);
  }, [answer, versions]);

  const canSubmit = useMemo(() => {
    return query.trim().length > 0 && !loading;
  }, [query, loading]);

  const showPrompt = answer == null && !loading && error == null;

  const submit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources(null);
    setVersions(null);
    setCurrentDraftIndex(0);

    try {
      const params = {
        query: query.trim(),
        use_knowledge_base: useKb,
        cite_sources: true,
        model: "openai/gpt-4o",
        depth: 2,
      } as const;

      // Use apiService to include Authorization header from auth store
      const { data } = await apiService.get<AnswerResponse>(
        "/writing/answer",
        params as unknown as Record<string, string | number | boolean>
      );

      setAnswer(data?.result ?? null);
      setSources(Array.isArray(data?.sources) ? data?.sources : null);
      setVersions(Array.isArray(data?.versions) ? data?.versions : null);

      // Reset scroll position on new content
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }, 0);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [canSubmit, query, useKb]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const drafts = useMemo(() => {
    const items: string[] = [];
    if (answer) {
      items.push(answer);
    }
    if (Array.isArray(versions)) {
      items.push(...versions);
    }
    return items;
  }, [answer, versions]);

  const currentDraft = drafts[currentDraftIndex] ?? drafts[0] ?? "";

  const handleCitationClick = useCallback((n: number) => {
    const el = sourceRefs.current[n];
    if (el) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        // Ignore scroll errors
      }
      setHighlightedSource(n);
      // Clear highlight after a short delay
      window.setTimeout(
        () => setHighlightedSource((prev) => (prev === n ? null : prev)),
        HIGHLIGHT_DURATION_MS
      );
    }
  }, []);

  const renderAnswerWithCitations = useCallback(
    (text: string) => {
      const parts: React.ReactNode[] = [];
      const regex = /\[(\d+)\]/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while (true) {
        match = regex.exec(text);
        if (match === null) {
          break;
        }
        const idx = match.index;
        const num = Number(match[1]);
        if (idx > lastIndex) {
          parts.push(text.slice(lastIndex, idx));
        }
        parts.push(
          <button
            aria-label={`Jump to source ${num}`}
            className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm border px-1 align-super text-[10px] text-muted-foreground leading-none hover:border-primary hover:text-primary"
            key={`cite-${idx}`}
            onClick={() => handleCitationClick(num)}
            type="button"
          >
            {num}
          </button>
        );
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }
      return parts;
    },
    [handleCitationClick]
  );

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "calc(100vh - var(--fd-nav-height))" }}
    >
      <div className="container mx-auto flex flex-1 flex-col p-8">
        {/* Scrollable answer area with sources inside */}
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="relative p-6" ref={scrollRef}>
              {showPrompt && (
                <div className="text-muted-foreground text-sm">
                  Ask a question to get started.
                </div>
              )}
              {loading && (
                <div className="text-muted-foreground text-sm">Thinking…</div>
              )}
              {error && <div className="text-destructive text-sm">{error}</div>}

              {hasContent && !loading && !error && (
                <div className="space-y-6">
                  {/* Current draft content with clickable citations */}
                  <div className="whitespace-pre-wrap">
                    {renderAnswerWithCitations(currentDraft)}
                  </div>

                  {/* Sources table */}
                  {Array.isArray(sources) && sources.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-3 flex items-center gap-2">
                        <BookOpen className="size-4" />
                        <span className="font-medium">Context</span>
                      </div>
                      <div className="max-h-96 overflow-auto rounded-md border">
                        <Table className="w-full table-fixed">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">Title</TableHead>
                              <TableHead className="w-1/2">Summary</TableHead>
                              <TableHead className="w-1/4">Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sources.map((s, index) => {
                              const cIndex =
                                typeof s.citation_index === "number"
                                  ? s.citation_index
                                  : index + 1;
                              const isHighlighted =
                                highlightedSource === cIndex;
                              return (
                                <TableRow
                                  className={cn(
                                    isHighlighted && "bg-primary/10"
                                  )}
                                  key={s.id || `${index}`}
                                  ref={(el) => {
                                    sourceRefs.current[cIndex] = el;
                                  }}
                                >
                                  <TableCell className="max-w-0 truncate font-medium">
                                    {s.title || s.document_title || s.id}
                                  </TableCell>
                                  <TableCell className="max-w-0 truncate text-muted-foreground text-sm">
                                    {s.summary || s.document_summary || ""}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline">
                                      {s.type || "Document"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Draft navigation moved to footer */}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer input area with KB switch and draft arrows */}
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                aria-label="Use knowledge base"
                checked={useKb}
                onCheckedChange={(v) => setUseKb(Boolean(v))}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Brain aria-hidden className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6}>
                  Use knowledge base
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              aria-label="Ask a question"
              disabled={loading}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask something…"
              value={query}
            />
            <Button
              aria-label="Send"
              disabled={!canSubmit}
              size="icon"
              type="submit"
            >
              <Send className="size-4" />
            </Button>
            {Array.isArray(versions) && versions.length > 0 && (
              <div className="ml-2 flex items-center gap-2">
                <Button
                  aria-label="Previous draft"
                  onClick={() => {
                    const total = 1 + (versions?.length || 0);
                    setCurrentDraftIndex((i) => (i - 1 + total) % total);
                  }}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  aria-label="Next draft"
                  onClick={() => {
                    const total = 1 + (versions?.length || 0);
                    setCurrentDraftIndex((i) => (i + 1) % total);
                  }}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

