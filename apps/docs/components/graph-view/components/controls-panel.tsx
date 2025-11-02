"use client";

import {
  IconArrowsJoin,
  IconArrowsMaximize,
  IconArrowsSplit,
  IconHierarchy3,
  IconLoader2,
  IconMaximize,
  IconMinus,
  IconPlayerStop,
  IconPlus,
  IconTopologyStar3,
} from "@tabler/icons-react";
import { Button } from "@recurse/ui/components/button";
import { IconToggleButton } from "@/components/ui/icon-toggle-button";
import { Kbd } from "@/components/ui/kibo-ui/kbd";

type GraphControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
  layoutMode: "force" | "hierarchical";
  onToggleLayoutMode: () => void;
  onExpandLevel: () => void;
  onCollapseLevel: () => void;
  isExpanding: boolean;
  isCollapsing: boolean;
  expansionProgress: { current: number; total: number } | null;
  onStopExpansion: () => void;
  onStopCollapsing: () => void;
  onOpenFullscreen?: () => void;
};

export function GraphControls(props: GraphControlsProps) {
  const {
    onZoomIn,
    onZoomOut,
    onFitAll,
    layoutMode,
    onToggleLayoutMode,
    onExpandLevel,
    onCollapseLevel,
    isExpanding,
    isCollapsing,
    expansionProgress,
    onStopExpansion,
    onStopCollapsing,
    onOpenFullscreen,
  } = props;

  const getExpandTooltip = () => {
    if (isExpanding) {
      if (expansionProgress) {
        const percentage = Math.round(
          (expansionProgress.current / expansionProgress.total) * 100
        );
        return `Expanding level... (${expansionProgress.current}/${expansionProgress.total}, ${percentage}%)`;
      }
      return "Click to stop expanding level";
    }
    return (
      <>
        Expand next level{" "}
        <Kbd>
          <span>E</span>
        </Kbd>
      </>
    );
  };

  const getCollapseTooltip = () => {
    if (isCollapsing) {
      return "Click to stop collapsing level";
    }
    return (
      <>
        Collapse one level{" "}
        <Kbd>
          <span>C</span>
        </Kbd>
      </>
    );
  };

  return (
    <>
      {/* Zoom Controls - Top Left */}
      <div className="pointer-events-auto absolute top-4 left-4 z-2 flex flex-col gap-2 rounded-md border border-border bg-background p-2">
        <Button
          className="size-6"
          onClick={onZoomIn}
          size="icon"
          tooltip={
            <>
              Zoom In{" "}
              <Kbd>
                <span>+</span>
              </Kbd>
            </>
          }
          tooltipSide="right"
          tooltipSideOffset={8}
          variant="outline"
        >
          <IconPlus className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        </Button>
        <Button
          className="size-6"
          onClick={onZoomOut}
          size="icon"
          tooltip={
            <>
              Zoom Out{" "}
              <Kbd>
                <span>-</span>
              </Kbd>
            </>
          }
          tooltipSide="right"
          tooltipSideOffset={8}
          variant="outline"
        >
          <IconMinus className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        </Button>
        <Button
          className="size-6"
          onClick={onFitAll}
          size="icon"
          tooltip={
            <>
              Fit All{" "}
              <Kbd>
                <span>F</span>
              </Kbd>
            </>
          }
          tooltipSide="right"
          tooltipSideOffset={8}
          variant="outline"
        >
          <IconMaximize className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        </Button>
      </div>

      {/* Fullscreen - Top Right (only when available) */}
      {onOpenFullscreen && (
        <div className="pointer-events-auto absolute top-4 right-4 z-2">
          <Button
            className="size-9 border border-border bg-background hover:bg-accent hover:text-accent-foreground"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenFullscreen();
            }}
            size="icon"
            tooltip={<>Open Fullscreen</>}
            type="button"
            variant="ghost"
          >
            <IconArrowsMaximize className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Layout + Level Controls - Bottom Left */}
      <div className="pointer-events-auto absolute bottom-4 left-4 z-2 flex gap-2 rounded-md border border-border bg-background p-2">
        <IconToggleButton
          className="size-6"
          icon1={IconHierarchy3}
          icon2={IconTopologyStar3}
          isIcon2Showing={layoutMode === "hierarchical"}
          onClick={() => onToggleLayoutMode()}
          tooltip={
            <>
              {layoutMode === "force"
                ? "Switch to Hierarchical Layout"
                : "Switch to Force Layout"}{" "}
              <Kbd>
                <span>L</span>
              </Kbd>
            </>
          }
        />

        {/* Level-based Expand/Collapse Controls */}
        {isExpanding ? (
          <IconToggleButton
            className="size-6"
            icon1={IconLoader2}
            icon1ClassName="animate-spin"
            icon2={IconPlayerStop}
            isIcon2Showing={true}
            onClick={() => onStopExpansion()}
            tooltip={getExpandTooltip()}
          />
        ) : (
          <Button
            className="size-6"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              const api = (
                window as unknown as {
                  graphSidePanel?: { expandNextLevel: () => void };
                }
              ).graphSidePanel;
              if (api?.expandNextLevel) {
                api.expandNextLevel();
              } else {
                onExpandLevel();
              }
            }}
            size="icon"
            tooltip={getExpandTooltip()}
            type="button"
            variant="outline"
          >
            <IconArrowsSplit className="h-4 w-4" />
          </Button>
        )}

        {isCollapsing ? (
          <IconToggleButton
            className="size-6"
            icon1={IconLoader2}
            icon1ClassName="animate-spin"
            icon2={IconPlayerStop}
            isIcon2Showing={true}
            onClick={() => onStopCollapsing()}
            tooltip={getCollapseTooltip()}
          />
        ) : (
          <Button
            className="size-6"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              const api = (
                window as unknown as {
                  graphSidePanel?: { collapseOneLevel: () => void };
                }
              ).graphSidePanel;
              if (api?.collapseOneLevel) {
                api.collapseOneLevel();
              } else {
                onCollapseLevel();
              }
            }}
            size="icon"
            tooltip={getCollapseTooltip()}
            type="button"
            variant="outline"
          >
            <IconArrowsJoin className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
}
