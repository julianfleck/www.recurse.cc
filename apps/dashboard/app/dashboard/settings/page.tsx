'use client';

import {
  EMBEDDING_MODEL,
  type ModelOption,
  PARSING_MODELS,
} from '@recurse/config/models';
import { CheckIcon, ChevronsUpDownIcon, HelpCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/components/auth/auth-store';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  // Seed defaults (could be loaded from API/local storage later)
  const authUser = useAuthStore((s) => s.user);

  const initialState = useMemo(
    () => ({
      defaultParsingModel:
        PARSING_MODELS.find((m) => m.value === 'gpt-4o')?.value ||
        PARSING_MODELS[0]?.value ||
        '',
      parsingModelApiKey: '',
      contextModel: PARSING_MODELS[0]?.value ?? '',
      contextModelApiKey: '',
      embeddingModel: EMBEDDING_MODEL.value,
      email: authUser?.email ?? '',
      password: '',
    }),
    [authUser?.email]
  );

  const [state, setState] = useState(initialState);
  const [baseline, setBaseline] = useState(initialState);
  const [openParsingModel, setOpenParsingModel] = useState(false);
  const [openContextModel, setOpenContextModel] = useState(false);

  useEffect(() => {
    // If auth user changes (e.g. after login), re-seed email baseline/state
    setState((prev) => ({ ...prev, email: authUser?.email ?? '' }));
    setBaseline((prev) => ({ ...prev, email: authUser?.email ?? '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email]);

  const isDirty = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(baseline),
    [state, baseline]
  );

  const parsingModelLabel = useMemo(() => {
    return (
      PARSING_MODELS.find((m) => m.value === state.defaultParsingModel)
        ?.label || 'Select model...'
    );
  }, [state.defaultParsingModel]);

  const contextModelLabel = useMemo(() => {
    return (
      PARSING_MODELS.find((m) => m.value === state.contextModel)?.label ||
      'Select model...'
    );
  }, [state.contextModel]);

  const handleSelectParsingModel = (value: string) => {
    setState((s) => ({ ...s, defaultParsingModel: value }));
    setOpenParsingModel(false);
  };

  const handleSelectContextModel = (value: string) => {
    setState((s) => ({ ...s, contextModel: value }));
    setOpenContextModel(false);
  };

  const handleSave = () => {
    // For now, we just update the baseline. Integration with backend will come later.
    setBaseline(state);
  };

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: 'calc(100vh - var(--fd-nav-height))' }}
    >
      <div className="container mx-auto flex flex-1 flex-col p-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Configure your default models and account details.
          </p>
        </div>

        <div className="space-y-8">
          {/* Model settings */}
          <section>
            <h2 className="mb-4 font-semibold text-xl">Model settings</h2>
            <div className="divide-y rounded-lg border">
              {/* Default Parsing Model */}
              <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-3">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    className="text-muted-foreground"
                    htmlFor="default-parsing-model"
                  >
                    Default Parsing Model
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Parsing model info"
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <HelpCircle className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-w-[260px]"
                      side="top"
                      sideOffset={4}
                    >
                      The parsing model is used to ingest content into RAGE. For
                      long-form documents, using a smaller model (e.g.
                      gpt-4o-mini) can save costs, while larger models produce
                      better quality. Recommendation: gpt-4o.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row">
                    <div className="flex items-center gap-2 sm:flex-1">
                      <Popover
                        onOpenChange={setOpenParsingModel}
                        open={openParsingModel}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            aria-expanded={openParsingModel}
                            className={cn('flex-1', 'justify-between')}
                            id="default-parsing-model"
                            role="combobox"
                            type="button"
                            variant="outline"
                          >
                            {parsingModelLabel}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search models..." />
                            <CommandList>
                              <CommandEmpty>No models found.</CommandEmpty>
                              <CommandGroup>
                                {PARSING_MODELS.map((model: ModelOption) => (
                                  <CommandItem
                                    key={model.value}
                                    onSelect={(currentValue) =>
                                      handleSelectParsingModel(currentValue)
                                    }
                                    value={model.value}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        state.defaultParsingModel ===
                                          model.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {model.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input
                      className="sm:flex-1"
                      id="parsing-model-api-key-inline"
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          parsingModelApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter API key"
                      value={state.parsingModelApiKey}
                    />
                  </div>
                </div>
              </div>

              {/* Context Model */}
              <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-3">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    className="text-muted-foreground"
                    htmlFor="context-model"
                  >
                    Context Model
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Context model info"
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <HelpCircle className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-w-[260px]"
                      side="top"
                      sideOffset={4}
                    >
                      The context model retrieves from the knowledge base and
                      answers questions. Since the provided context is accurate,
                      smaller models are often sufficient here.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row">
                    <div className="flex items-center gap-2 sm:flex-1">
                      <Popover
                        onOpenChange={setOpenContextModel}
                        open={openContextModel}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            aria-expanded={openContextModel}
                            className={cn('flex-1', 'justify-between')}
                            id="context-model"
                            role="combobox"
                            type="button"
                            variant="outline"
                          >
                            {contextModelLabel}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search models..." />
                            <CommandList>
                              <CommandEmpty>No models found.</CommandEmpty>
                              <CommandGroup>
                                {PARSING_MODELS.map((model: ModelOption) => (
                                  <CommandItem
                                    key={model.value}
                                    onSelect={(currentValue) =>
                                      handleSelectContextModel(currentValue)
                                    }
                                    value={model.value}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        state.contextModel === model.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {model.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input
                      className="sm:flex-1"
                      id="context-model-api-key-inline"
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          contextModelApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter API key"
                      value={state.contextModelApiKey}
                    />
                  </div>
                </div>
              </div>

              {/* Embedding Model (disabled) */}
              <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-3">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    className="text-muted-foreground"
                    htmlFor="embedding-model"
                  >
                    Embedding Model
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Embedding model info"
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <HelpCircle className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-w-[260px]"
                      side="top"
                      sideOffset={4}
                    >
                      We currently support only one embedding model, but custom
                      providers are coming soon.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Button
                    className={cn('justify-between', 'flex-1')}
                    disabled
                    id="embedding-model"
                    role="combobox"
                    type="button"
                    variant="outline"
                  >
                    {EMBEDDING_MODEL.label}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* User settings */}
          <section>
            <h2 className="mb-4 font-semibold text-xl">User settings</h2>
            <div className="divide-y rounded-lg border">
              {/* Email */}
              <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-3">
                <Label className="text-muted-foreground" htmlFor="email">
                  Email address
                </Label>
                <div className="sm:col-span-2">
                  <Input
                    id="email"
                    onChange={(e) =>
                      setState((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    type="email"
                    value={state.email}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-3">
                <Label className="text-muted-foreground" htmlFor="password">
                  Passwort
                </Label>
                <div className="sm:col-span-2">
                  <Input
                    id="password"
                    onChange={(e) =>
                      setState((s) => ({ ...s, password: e.target.value }))
                    }
                    placeholder="Set a new password"
                    type="password"
                    value={state.password}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-10 flex justify-end">
          <Button disabled={!isDirty} onClick={handleSave} type="button">
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
