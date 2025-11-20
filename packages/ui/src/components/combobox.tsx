'use client';

import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react';

import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '../lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

export interface ComboboxProps {
  options: readonly ComboboxOption[] | ComboboxOption[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
  showSearch?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option...',
  emptyMessage = 'No option found.',
  searchPlaceholder = 'Search...',
  disabled = false,
  className,
  multiple = false,
  showSearch = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value as string] : [];
  }, [value, multiple]);

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const displayText = React.useMemo(() => {
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    return `${selectedOptions.length} selected`;
  }, [selectedOptions, placeholder]);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onValueChange?.(newValues);
    } else {
      onValueChange?.(optionValue);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {displayText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          {showSearch && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    {isSelected ? (
                      <IconCircleCheckFilled className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    ) : (
                      <IconCircle className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

