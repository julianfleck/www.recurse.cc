'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface DiscreteMark {
  value: number;
  label: string;
}

interface DiscreteSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  marks: DiscreteMark[];
  min: number;
  max: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showLabels?: boolean;
  onMarkClick?: (value: number) => void;
}

export const DiscreteSlider: React.FC<DiscreteSliderProps> = ({
  value,
  onValueChange,
  onValueCommit,
  marks,
  min,
  max,
  step,
  orientation = 'horizontal',
  className,
  showLabels = true,
  onMarkClick,
}) => {
  const isVertical = orientation === 'vertical';
  const currentValue = value[0];
  const trackRef = useRef<HTMLDivElement>(null);
  const lastChangeValueRef = useRef<number[]>(value);
  const lastCommittedValueRef = useRef<number[]>(value);
  const commitSentRef = useRef(false);
  const [trackDimensions, setTrackDimensions] = useState({
    size: 0,
    offset: 0,
  });
  const [hoveredMark, setHoveredMark] = useState<number | null>(null);
  const [isTrackHovered, setIsTrackHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastDragEndRef = useRef<number>(0);

  // Don't use any step - allow completely smooth dragging
  // All snapping/rounding should be handled by the parent component in onValueCommit

  // Use marks as-is without validation/snapping
  const validMarks = useMemo(() => {
    return marks.filter((mark, index, arr) => {
      // Remove duplicates only
      return (
        arr.findIndex((m) => Math.abs(m.value - mark.value) < 0.0001) === index
      );
    });
  }, [marks]);

  // Update track dimensions when component mounts or resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        setTrackDimensions({
          size: isVertical ? rect.height : rect.width,
          offset: isVertical ? rect.top : rect.left,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isVertical]);

  // Position marks based on actual track dimensions
  const markPositions = useMemo(() => {
    if (!trackDimensions.size || validMarks.length === 0) {
      return [];
    }

    return validMarks.map((mark) => {
      const percentage = (mark.value - min) / (max - min);
      // For positioning, we need to account for thumb size (4px radius = 8px total width)
      const thumbSize = 16;
      const availableSpace = trackDimensions.size - thumbSize;
      const position = percentage * availableSpace + thumbSize / 2;

      return {
        ...mark,
        percentage,
        position: Math.max(
          thumbSize / 2,
          Math.min(trackDimensions.size - thumbSize / 2, position)
        ),
      };
    });
  }, [validMarks, min, max, trackDimensions.size]);

  // Show all marks without filtering
  const visibleMarks = markPositions;

  const handleMarkClick = (markValue: number) => {
    // Suppress clicks that occur immediately after a drag end (likely unintended)
    if (Date.now() - lastDragEndRef.current < 250) {
      return;
    }
    onValueChange([markValue]);
    onMarkClick?.(markValue);
  };

  // Keep refs up to date so we can access latest values in event handlers
  useEffect(() => {
    lastChangeValueRef.current = value;
  }, [value]);

  const fireCommitIfNeeded = React.useCallback(() => {
    if (!onValueCommit || commitSentRef.current) {
      return;
    }
    const changed =
      lastCommittedValueRef.current[0] !== lastChangeValueRef.current[0];
    if (changed) {
      onValueCommit(lastChangeValueRef.current);
      lastCommittedValueRef.current = lastChangeValueRef.current;
      commitSentRef.current = true;
    }
  }, [onValueCommit]);

  const handlePointerDown = () => {
    commitSentRef.current = false;
    setIsDragging(true);
  };

  const handlePointerUpOrLost = () => {
    setIsDragging(false);
    lastDragEndRef.current = Date.now();
    fireCommitIfNeeded();
  };

  return (
    // <TooltipProvider delayDuration={0}>
    <div
      className={cn(
        'relative flex items-center',
        isVertical ? 'h-64 flex-col' : 'w-64 flex-row',
        className
      )}
    >
      {/* Labels */}
      {showLabels && (
        <div
          className={cn(
            'flex shrink-0 text-muted-foreground text-xs',
            isVertical
              ? 'mr-2 h-full w-12 flex-col justify-between'
              : 'order-1 mt-2 h-6 w-full justify-between'
          )}
        >
          {isVertical
            ? // For vertical, show marks from top to bottom (highest to lowest value)
              [...validMarks]
                .reverse()
                .map((mark, index) => (
                  <div
                    className="flex items-center"
                    key={`${mark.value}-${index}`}
                  >
                    <span className="leading-none">{mark.label}</span>
                  </div>
                ))
            : // For horizontal, show marks from left to right
              validMarks.map((mark, index) => (
                <div
                  className="flex justify-center"
                  key={`${mark.value}-${index}`}
                >
                  <span className="leading-none">{mark.label}</span>
                </div>
              ))}
        </div>
      )}

      {/* Slider container */}
      <div className="relative flex-1">
        <SliderPrimitive.Root
          className={cn(
            'relative flex touch-none select-none items-center',
            isVertical
              ? 'h-full w-5 flex-col justify-center'
              : 'h-5 w-full justify-center'
          )}
          max={max}
          min={min}
          onLostPointerCapture={handlePointerUpOrLost}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUpOrLost}
          onValueChange={(val) => {
            onValueChange(val);
          }}
          onValueCommit={(val) => {
            if (commitSentRef.current) {
              return;
            }
            onValueCommit?.(val);
            lastCommittedValueRef.current = val;
            commitSentRef.current = true;
          }}
          orientation={orientation}
          step={step ?? 0.1}
          value={value}
        >
          {/* Track */}
          <SliderPrimitive.Track
            className={cn(
              'relative overflow-hidden rounded-full bg-muted transition-colors duration-200',
              isVertical ? 'h-full w-1.5' : 'h-1.5 w-full',
              isTrackHovered && 'bg-muted/80'
            )}
            onMouseEnter={() => setIsTrackHovered(true)}
            onMouseLeave={() => setIsTrackHovered(false)}
            ref={trackRef}
          >
            <SliderPrimitive.Range className="absolute h-full w-full bg-primary" />
          </SliderPrimitive.Track>

          {/* Visual marks positioned using actual track dimensions */}
          {trackDimensions.size > 0 &&
            visibleMarks.map((mark) => {
              const isActive = mark.value <= currentValue;
              const isHovered = hoveredMark === mark.value;

              return (
                <div
                  className="pointer-events-none absolute"
                  key={`mark-${mark.value}`}
                  style={
                    isVertical
                      ? {
                          bottom: `${mark.position}px`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }
                      : {
                          left: `${mark.position}px`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }
                  }
                >
                  {/* Tick mark */}
                  <div
                    className={cn(
                      'rounded-full transition-all duration-200',
                      isVertical ? 'h-px w-3' : 'h-3 w-px',
                      isActive
                        ? 'bg-muted-foreground/20'
                        : 'bg-muted-foreground/40',
                      isHovered && 'scale-150 bg-muted-foreground/60 shadow-md'
                    )}
                  />
                </div>
              );
            })}

          {/* Interactive mark hit areas */}
          {trackDimensions.size > 0 &&
            visibleMarks.map((mark) => (
              <button
                aria-label={`Set to ${mark.label}`}
                className={cn(
                  'absolute z-10 rounded-sm transition-colors hover:bg-accent/20',
                  isVertical ? 'h-4 w-5' : 'h-5 w-4',
                  isDragging && 'pointer-events-none'
                )}
                disabled={isDragging}
                key={`interactive-${mark.value}`}
                onClick={() => handleMarkClick(mark.value)}
                onMouseEnter={() => setHoveredMark(mark.value)}
                onMouseLeave={() => setHoveredMark(null)}
                style={
                  isVertical
                    ? {
                        bottom: `${mark.position - 8}px`,
                        left: '0',
                      }
                    : {
                        left: `${mark.position - 8}px`,
                        top: '0',
                      }
                }
              />
            ))}

          {/* Thumb */}
          <SliderPrimitive.Thumb className="z-20 block h-4 w-4 rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Root>
      </div>
    </div>
    // </TooltipProvider>
  );
};

export type { DiscreteMark };
