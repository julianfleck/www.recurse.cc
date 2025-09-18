"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckIcon,
  ChevronsUpDownIcon,
  Copy,
  Key,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiService } from "@/lib/api";
import { cn } from "@/lib/utils";

// Constants
const ANIMATION_OFFSET = 300;
const COPY_TIMEOUT_MS = 2000;
const COMBOBOX_WIDTH = "w-full";
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 100;

const STEP_SETTINGS = 1;
const STEP_SUCCESS = 2;

const SCOPES = [
  { value: "all", label: "All (read, write, export)" },
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "export", label: "Export" },
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
  currentStep: typeof STEP_SETTINGS | typeof STEP_SUCCESS;
  onStepClick: (step: typeof STEP_SETTINGS | typeof STEP_SUCCESS) => void;
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
    { id: STEP_SUCCESS, label: "Success", description: "Copy your secret key" },
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
              onClick={() => isClickable && onStepClick(step.id)}
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
  direction: number; // 1 for forward, -1 for backward
};

function StepContent({
  step,
  children,
  direction: animationDirection,
}: StepContentProps) {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? ANIMATION_OFFSET : -ANIMATION_OFFSET,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? ANIMATION_OFFSET : -ANIMATION_OFFSET,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence custom={animationDirection} mode="wait">
      <motion.div
        animate="center"
        className="w-full"
        custom={animationDirection}
        exit="exit"
        initial="enter"
        key={step}
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
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

type ApiKeyResponse = {
  id: string;
  secret: string;
  name: string;
  expires_at: string | null;
  scopes: string[];
  data_scope: "user" | "api_key";
  created_at: string;
};

export function ApiKeyDialog({
  open,
  onOpenChange,
  onSuccess,
}: ApiKeyDialogProps) {
  const [currentStep, setCurrentStep] = useState<
    typeof STEP_SETTINGS | typeof STEP_SUCCESS
  >(STEP_SETTINGS);
  const [direction, setDirection] = useState(1);

  // Form state
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState<{ from?: Date; to?: Date }>({});
  const [scopes, setScopes] = useState<string[]>(["all"]);
  const [dataScope, setDataScope] = useState<"user" | "api_key">("user");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Success state
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Loading state
  const [creating, setCreating] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(STEP_SETTINGS);
      setDirection(1);
      setName("");
      setExpiresAt({});
      setScopes(["all"]);
      setDataScope("user");
      setFieldErrors({});
      setCreatedKey(null);
      setCopied(false);
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
      setDirection(1);
      setCurrentStep(STEP_SUCCESS);
      onSuccess?.();
    } catch {
      setFieldErrors({
        general: "Failed to create API key. Please try again.",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopySecret = async () => {
    if (createdKey?.secret) {
      await navigator.clipboard.writeText(createdKey.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT_MS);
    }
  };

  const goToStep = (target: typeof STEP_SETTINGS | typeof STEP_SUCCESS) => {
    if (target < currentStep) {
      setDirection(-1);
      setCurrentStep(target);
    } else if (target > currentStep) {
      setDirection(1);
      setCurrentStep(target);
    }
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
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <DialogTitle>Create New API Key</DialogTitle>
          </div>
          <DialogDescription>
            Generate a new API key for programmatic access to your account.
          </DialogDescription>
        </DialogHeader>

        <StepProgress currentStep={currentStep} onStepClick={goToStep} />

        <div className="min-h-[400px] py-6">
          {currentStep === STEP_SETTINGS && (
            <StepContent direction={direction} step={1}>
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
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
                    onChange={(date) => setExpiresAt(typeof date === 'object' && 'from' in date ? date : { from: date })}
                    placeholder="never, in 1 month, 2024-12-31..."
                    value={expiresAt}
                  />
                </div>

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
                                      ? scopes.filter((s) => s !== scope.value)
                                      : [
                                          ...scopes.filter((s) => s !== "all"),
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
                <div className="space-y-3">
                  <Label>Data Scope</Label>
                  <RadioGroup
                    onValueChange={(value: "user" | "api_key") =>
                      setDataScope(value)
                    }
                    value={dataScope}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="user" value="user" />
                      <Label className="font-normal" htmlFor="user">
                        User Scope
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="api_key" value="api_key" />
                      <Label className="font-normal" htmlFor="api_key">
                        API Key Scope
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    {getScopeDescription(dataScope)}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
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

          {currentStep === STEP_SUCCESS && (
            <StepContent direction={direction} step={2}>
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    API Key Created Successfully!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your new API key has been generated. Make sure to copy and
                    store it securely.
                  </p>
                </div>

                {createdKey && (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium text-sm">
                            API Key ID
                          </Label>
                          <Button
                            onClick={() =>
                              navigator.clipboard.writeText(createdKey.id)
                            }
                            size="sm"
                            variant="ghost"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <code className="block break-all font-mono text-sm">
                          {createdKey.id}
                        </code>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium text-sm">
                            Secret Key
                          </Label>
                          <Button
                            disabled={copied}
                            onClick={handleCopySecret}
                            size="sm"
                            variant="ghost"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <code className="block break-all font-mono text-sm">
                          {createdKey.secret}
                        </code>
                        {copied && (
                          <div className="text-green-600 text-xs">
                            Copied to clipboard!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
                  <p>
                    ⚠️ This is the only time you'll see this secret key. Store it
                    securely and never share it publicly.
                  </p>
                </div>
              </div>
            </StepContent>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between">
          {currentStep === STEP_SETTINGS && (
            <Button
              className="h-11 bg-primary shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
              disabled={creating}
              icon={<ArrowRight className="size-4" />}
              iconSide="right"
              onClick={handleCreateKey}
              showIconOnHover={true}
            >
              {creating ? "Creating…" : "Create API Key"}
            </Button>
          )}

          {currentStep === STEP_SUCCESS && (
            <Button className="h-11" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
