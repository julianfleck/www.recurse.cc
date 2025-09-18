'use client';

import { parseDate } from 'chrono-node';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CalendarNaturalLanguageProps {
  value?: Date | { from?: Date; to?: Date };
  onChange?: (date: Date | { from?: Date; to?: Date }) => void;
  placeholder?: string;
  className?: string;
}

export function CalendarNaturalLanguage({
  value,
  onChange,
  placeholder = 'yesterday, last week...',
  className,
}: CalendarNaturalLanguageProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [naturalInput, setNaturalInput] = useState('');

  // Handle both single date and range
  const dateRange = typeof value === 'object' && 'from' in value ? value : { from: value };
  const timeRange = { start: '', end: '' };

  const setDateRange = (range: { from?: Date; to?: Date }) => {
    onChange?.(range);
  };

  const setTimeRange = (range: { start: string; end: string }) => {
    // For now, just handle date, time can be added later if needed
  };

  return (
    <div className={`relative flex gap-2 ${className || ''}`}>
      <Input
        className="h-9 w-[240px] pr-16 placeholder:text-muted-foreground/40"
        onChange={(e) => {
          setNaturalInput(e.target.value);

          // Clear filters if input is empty
          if (!e.target.value.trim()) {
            setDateRange({});
            setTimeRange({ start: '', end: '' });
            return;
          }

          const parsed = parseDate(e.target.value);
          if (parsed) {
            const now = new Date();
            const inputLower = e.target.value.toLowerCase().trim();

            // For relative terms like "last week", "yesterday", etc., create a range to today
            if (
              inputLower.includes('last') ||
              inputLower.includes('yesterday') ||
              inputLower.includes('ago') ||
              inputLower.includes('past')
            ) {
              setDateRange({ from: parsed, to: now });
            } else {
              // For specific dates, use just that date
              setDateRange({ from: parsed, to: parsed });
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setDatePickerOpen(true);
          }
        }}
        placeholder={(() => {
          const hasFilters =
            dateRange.from ||
            dateRange.to ||
            timeRange.start ||
            timeRange.end ||
            naturalInput;

          if (!hasFilters) {
            return placeholder;
          }

          if (naturalInput) {
            return; // Show the actual natural input value
          }

          const parts = [];

          // Date part
          if (dateRange.from && dateRange.to) {
            parts.push(
              `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
            );
          } else if (dateRange.from) {
            parts.push(`From ${dateRange.from.toLocaleDateString()}`);
          } else if (dateRange.to) {
            parts.push(`Until ${dateRange.to.toLocaleDateString()}`);
          }

          // Time part
          if (timeRange.start && timeRange.end) {
            parts.push(`${timeRange.start} - ${timeRange.end}`);
          } else if (timeRange.start) {
            parts.push(`From ${timeRange.start}`);
          } else if (timeRange.end) {
            parts.push(`Until ${timeRange.end}`);
          }

          return parts.join(' • ') || 'filters active...';
        })()}
        value={naturalInput}
      />
      {/* Show X button when there's text (left side) */}
      {naturalInput.trim() && (
        <Button
          className="-translate-y-1/2 absolute top-1/2 right-8 size-6"
          onClick={() => {
            setNaturalInput('');
            setDateRange({});
            setTimeRange({ start: '', end: '' });
          }}
          size="sm"
          variant="ghost"
        >
          <X className="size-3.5" />
          <span className="sr-only">Clear</span>
        </Button>
      )}

      {/* Always show calendar icon (right side) */}
      <Popover onOpenChange={setDatePickerOpen} open={datePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            className="-translate-y-1/2 absolute top-1/2 right-2 size-6"
            size="sm"
            variant="ghost"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Open calendar</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-4">
          <div className="space-y-4">
            {/* Calendar and time in a horizontal layout */}
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label className="font-medium text-sm">Date</Label>
                <Calendar
                  captionLayout="dropdown"
                  mode="single"
                  onSelect={(date) => {
                    if (date) {
                      setDateRange({ from: date, to: date });
                      setNaturalInput('');
                      setDatePickerOpen(false);
                    }
                  }}
                  selected={dateRange.from}
                />
              </div>

              <div className="min-w-[140px] space-y-3">
                <Label className="font-medium text-sm">Time</Label>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">
                      Time:
                    </Label>
                    <Input
                      className="h-8 w-full appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      onChange={(event) =>
                        setTimeRange((prev) => ({
                          ...prev,
                          start: event.target.value,
                        }))
                      }
                      type="time"
                      value={timeRange.start}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                onClick={() => {
                  setDateRange({});
                  setTimeRange({ start: '', end: '' });
                  setNaturalInput('');
                }}
                size="sm"
                variant="outline"
              >
                Clear
              </Button>
              <Button onClick={() => setDatePickerOpen(false)} size="sm">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}