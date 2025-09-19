"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ApiKeyDialogSuccess } from "@/components/api-keys/api-key-dialog-success";
import { CalendarNaturalLanguage } from "@/components/calendar-natural-language";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiService } from "@/lib/api";
import { cn } from "@/lib/utils";

// Constants
const COMBOBOX_WIDTH = "w-full";
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 100;

const STEP_SETTINGS = 1;

const SCOPES = [
  { value: "all", label: "All (read, write, export)" },
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "export", label: "Export" },
] as const;

const DATA_SCOPES = [
  { value: "user", label: "User Scope" },
  { value: "api_key", label: "API Key Scope" },
] as const;

const apiKeySchema = z
  .object({
    name: z
      .string()
      .min(MIN_NAME_LENGTH, "Name is required")
      .max(MAX_NAME_LENGTH, "Name is too long"),
    expires_at: z.date().optional(),
    scopes: z.array(z.string()),
    data_scope: z.enum(["user", "api_key"]),
  })
  .refine(
    (data) => {
      if (data.scopes.includes("all") && data.scopes.length > 1) {
        return false;
      }
      return true;
    },
    {
      message: 'Cannot select "all" with other scopes',
      path: ["scopes"],
    }
  );

type StepProgressProps = {
  currentStep: typeof STEP_SETTINGS | 2;
  onStepClick: (step: typeof STEP_SETTINGS | 2) => void;
  className?: string;
};

function StepProgress({
  currentStep,
  onStepClick,
  className,
}: StepProgressProps) {
  const STEPS = [
    {
      id: STEP_SETTINGS,
      label: "Settings",
      description: "Configure your API key",
    },
    { id: 2, label: "Success", description: "Copy your secret key" },
  ];

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="mt-4 flex h-1 w-full gap-1">
        {STEPS.map((step, _index) => {
          const isActive = step.id <= currentStep;
          const isClickable = step.id < currentStep;

          return (
            <button
              className={cn(
                "flex-1 rounded-full transition-all duration-300 ease-in-out",
                isActive ? "bg-primary" : "bg-muted",
                isClickable && "cursor-pointer hover:bg-primary/80",
                !isClickable && "cursor-default"
              )}
              disabled={!isClickable}
              key={step.id}
              onClick={() =>
                isClickable &&
                onStepClick(
                  step.id as typeof STEP_SETTINGS | 2
                )
              }
              type="button"
            />
          );
        })}
      </div>
    </div>
  );
}

type StepContentProps = {
  step: number;
  children: React.ReactNode;
};

function StepContent({ step, children }: StepContentProps) {
  const variants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate="center"
        className="w-full"
        exit="exit"
        initial="enter"
        key={step}
        transition={{
          opacity: { duration: 0.2 },
        }}
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

type ApiKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};


export function ApiKeyDialog({
  open,
  onOpenChange,
  onSuccess,
}: ApiKeyDialogProps) {
  const [currentStep, setCurrentStep] = useState<
    typeof STEP_SETTINGS | 2
  >(STEP_SETTINGS);

  // Form state
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState<{ from?: Date; to?: Date }>({});
  const [scopes, setScopes] = useState<string[]>(["all"]);
  const [dataScope, setDataScope] = useState<"user" | "api_key">("user");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Success state
  const [createdKey, setCreatedKey] = useState<{
    id: string;
    secret: string;
    name: string;
    expires_at: string | null;
    scopes: string[];
    data_scope: "user" | "api_key";
    created_at: string;
  } | null>(null);

  // Loading state
  const [creating, setCreating] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(STEP_SETTINGS);
      setName("");
      setExpiresAt({});
      setScopes(["all"]);
      setDataScope("user");
      setFieldErrors({});
      setCreatedKey(null);
    }
  }, [open]);

  const validateForm = () => {
    const data = {
      name: name.trim(),
      expires_at: expiresAt.from,
      scopes,
      data_scope: dataScope,
    };

    const parsed = apiKeySchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const iss of parsed.error.issues) {
        const key = iss.path[0] as string;
        if (key) {
          errs[key] = iss.message;
        }
      }
      setFieldErrors(errs);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleCreateKey = async () => {
    if (!validateForm()) {
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: name.trim(),
        expires_at: expiresAt.from ? expiresAt.from.toISOString() : null,
        scopes: scopes.includes("all") ? [] : scopes,
        data_scope: dataScope,
      };

      const response = await apiService.post<ApiKeyResponse>(
        "/users/me/api-keys",
        payload
      );
      setCreatedKey(response.data);
      setCurrentStep(2);
      onSuccess?.();
    } catch {
      setFieldErrors({
        general: "Failed to create API key. Please try again.",
      });
    } finally {
      setCreating(false);
    }
  };


  const goToStep = (target: typeof STEP_SETTINGS | 2) => {
    setCurrentStep(target);
  };

  const getScopeDescription = (scope: "user" | "api_key") => {
    return scope === "user"
      ? "Content added or retrieved will be visible to your user account and can be accessed by other API keys you create."
      : "Content added or retrieved will only be visible to this specific API key. Other API keys and your user account will not have access.";
  };

  const getScopeButtonText = () => {
    if (scopes.length === 0) {
      return "Select permissions...";
    }
    if (scopes.includes("all")) {
      return "All permissions";
    }
    return `${scopes.length} permission${scopes.length > 1 ? "s" : ""} selected`;
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for programmatic access to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[400px] py-6">
          {currentStep === STEP_SETTINGS && (
            <StepContent step={1}>
              <div className="space-y-6">
                {/* Name and Expiration Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Key Name */}
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My API Key"
                      value={name}
                    />
                    {fieldErrors.name && (
                      <div className="text-destructive text-xs">
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>

                  {/* Expires At */}
                  <div className="space-y-2">
                    <Label>Expiration Date (Optional)</Label>
                    <CalendarNaturalLanguage
                      onChange={setExpiresAt}
                      placeholder="never, in 1 month..."
                      value={expiresAt}
                    />
                  </div>
                </div>

                {/* Permissions and Data Scope Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Scopes */}
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className={`${COMBOBOX_WIDTH} justify-between`}
                          role="combobox"
                          variant="outline"
                        >
                          {getScopeButtonText()}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search permissions..." />
                          <CommandList>
                            <CommandEmpty>No permissions found.</CommandEmpty>
                            <CommandGroup>
                              {SCOPES.map((scope) => (
                                <CommandItem
                                  key={scope.value}
                                  onSelect={() => {
                                    if (scope.value === "all") {
                                      setScopes(["all"]);
                                    } else {
                                      const newScopes = scopes.includes(
                                        scope.value
                                      )
                                        ? scopes.filter(
                                            (s) => s !== scope.value
                                          )
                                        : [
                                            ...scopes.filter(
                                              (s) => s !== "all"
                                            ),
                                            scope.value,
                                          ];
                                      setScopes(
                                        newScopes.length === 0
                                          ? ["all"]
                                          : newScopes
                                      );
                                    }
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      scopes.includes(scope.value)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {scope.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {fieldErrors.scopes && (
                      <div className="text-destructive text-xs">
                        {fieldErrors.scopes}
                      </div>
                    )}
                  </div>

                  {/* Data Scope */}
                  <div className="space-y-2">
                    <Label>Data Scope</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className={`${COMBOBOX_WIDTH} justify-between`}
                          role="combobox"
                          variant="outline"
                        >
                          {DATA_SCOPES.find(
                            (scope) => scope.value === dataScope
                          )?.label || "Select scope..."}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search scopes..." />
                          <CommandList>
                            <CommandEmpty>No scopes found.</CommandEmpty>
                            <CommandGroup>
                              {DATA_SCOPES.map((scope) => (
                                <CommandItem
                                  key={scope.value}
                                  onSelect={() => {
                                    setDataScope(
                                      scope.value as "user" | "api_key"
                                    );
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      dataScope === scope.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {scope.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Data Scope Description */}
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  {getScopeDescription(dataScope)}
                </div>

                {/* Security Notice */}
                <div className="text-muted-foreground text-sm">
                  <p>
                    Do not share your API key with others or expose it in the
                    browser or other client-side code. To protect your account's
                    security, we may automatically disable any API key that has
                    leaked publicly.
                    <a
                      className="ml-1 underline hover:no-underline"
                      href="/dashboard/usage"
                    >
                      View usage per API key on the Usage page.
                    </a>
                  </p>
                </div>

                {/* Error */}
                {fieldErrors.general && (
                  <div className="text-destructive text-sm">
                    {fieldErrors.general}
                  </div>
                )}
              </div>
            </StepContent>
          )}

        </div>

        {/* Footer */}
        <div className="w-full">
          {currentStep === STEP_SETTINGS && (
            <Button
              className="h-11 w-full bg-primary shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
              disabled={creating}
              icon={<ArrowRight className="size-4" />}
              iconSide="right"
              onClick={handleCreateKey}
              showIconOnHover={true}
            >
              {creating ? "Creating…" : "Create API Key"}
            </Button>
          )}
        </div>
      </DialogContent>

      {/* Success Dialog */}
      {createdKey && (
        <ApiKeyDialogSuccess
          createdKey={createdKey}
          onOpenChange={(successOpen) => {
            if (!successOpen) {
              onOpenChange(false);
              setCreatedKey(null);
            }
          }}
          open={currentStep === 2}
        />
      )}
    </Dialog>
  );
}
