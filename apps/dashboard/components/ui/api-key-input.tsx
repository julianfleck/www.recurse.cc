"use client";

import { CheckCircle2, Edit, Eye, EyeOff, Loader2, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@recurse/ui/components/tooltip";
import { validateApiKey, type ValidationStatus } from "@/lib/validate-api-key";
import { cn } from "@/lib/utils";

interface ApiKeyInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
	provider: string;
	/** True if the current value is a preview key from the backend (not user-entered) */
	isPreview?: boolean;
	onValidationChange?: (isValid: boolean, status: ValidationStatus) => void;
}

export function ApiKeyInput({
	provider,
	isPreview = false,
	onValidationChange,
	className,
	value,
	onChange,
	...props
}: ApiKeyInputProps) {
	const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
	const [showKey, setShowKey] = useState(false);
	const [originalPreviewKey, setOriginalPreviewKey] = useState<string | null>(null);
	
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const onValidationChangeRef = useRef(onValidationChange);

	useEffect(() => {
		onValidationChangeRef.current = onValidationChange;
	}, [onValidationChange]);

	// Derived state
	const stringValue = typeof value === "string" ? value : "";
	const isEditingPreview = originalPreviewKey !== null;
	const isReadonly = isPreview && !isEditingPreview;
	const hasValue = stringValue.length > 0;

	// Validation effect - only validate user-entered keys (not previews)
	useEffect(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}

		// Don't validate: no value, no provider, preview keys, or too short
		if (!stringValue || !provider || isPreview || stringValue.length < 20) {
			setValidationStatus("idle");
			onValidationChangeRef.current?.(false, "idle");
			return;
		}

		setValidationStatus("validating");
		onValidationChangeRef.current?.(false, "validating");

		debounceTimerRef.current = setTimeout(async () => {
			const result = await validateApiKey(provider, stringValue);
			setValidationStatus(result.status);
			onValidationChangeRef.current?.(result.status === "valid", result.status);
		}, 800);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [stringValue, provider, isPreview]);

	// Reset edit state when value returns to original preview
	useEffect(() => {
		if (originalPreviewKey && value === originalPreviewKey) {
			setOriginalPreviewKey(null);
			setShowKey(false);
		}
	}, [value, originalPreviewKey]);

	const handleEditClick = () => {
		if (isPreview && stringValue) {
			setOriginalPreviewKey(stringValue);
			onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
		}
	};

	const handleCancelClick = () => {
		if (originalPreviewKey && onChange) {
			onChange({ target: { value: originalPreviewKey } } as React.ChangeEvent<HTMLInputElement>);
		}
		setOriginalPreviewKey(null);
		setShowKey(false);
		setValidationStatus("idle");
	};

	// Status icon (only one at a time, replaces previous)
	const renderStatusIcon = () => {
		if (isReadonly) return null;
		
		switch (validationStatus) {
			case "validating":
				return (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="p-0.5">
								<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={4}>
							Validating API key...
						</TooltipContent>
					</Tooltip>
				);
			case "valid":
				return (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="p-0.5">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={4}>
							API key is valid
						</TooltipContent>
					</Tooltip>
				);
			case "invalid":
				return (
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="p-0.5">
								<XCircle className="h-4 w-4 text-destructive" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={4}>
							API key is invalid
						</TooltipContent>
					</Tooltip>
				);
			default:
				return null;
		}
	};

	// Action button (only one at a time)
	const renderActionButton = () => {
		// Preview mode: show edit button
		if (isReadonly && hasValue) {
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handleEditClick}
							className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Change API key"
						>
							<Edit className="h-4 w-4" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" sideOffset={4}>
						Change API key
					</TooltipContent>
				</Tooltip>
			);
		}

		// Editing a preview: show cancel (but not during validation)
		if (isEditingPreview && validationStatus !== "validating") {
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handleCancelClick}
							className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Cancel and restore previous key"
						>
							<RotateCcw className="h-4 w-4" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" sideOffset={4}>
						Cancel and restore previous key
					</TooltipContent>
				</Tooltip>
			);
		}

		// Normal editing: show eye toggle
		if (!isReadonly && hasValue) {
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
							tabIndex={-1}
							aria-label={showKey ? "Hide API key" : "Show API key"}
						>
							{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</button>
					</TooltipTrigger>
					<TooltipContent side="top" sideOffset={4}>
						{showKey ? "Hide API key" : "Show API key"}
					</TooltipContent>
				</Tooltip>
			);
		}

		return null;
	};

	return (
		<div className="relative">
			<Input
				{...props}
				type={isReadonly ? "text" : showKey ? "text" : "password"}
				value={value}
				onChange={onChange}
				disabled={isReadonly}
				readOnly={isReadonly}
				className={cn(
					"pr-16",
					isReadonly && "bg-muted cursor-default",
					className,
				)}
			/>
			<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
				{renderStatusIcon()}
				{renderActionButton()}
			</div>
		</div>
	);
}
