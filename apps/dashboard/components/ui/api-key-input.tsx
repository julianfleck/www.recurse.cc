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
	onValidationChange?: (isValid: boolean, status: ValidationStatus) => void;
	/** If true, shows the key in readonly mode with edit button instead of eye icon */
	isPreview?: boolean;
}

export function ApiKeyInput({
	provider,
	onValidationChange,
	isPreview = false,
	className,
	value,
	onChange,
	...props
}: ApiKeyInputProps) {
	const [validationStatus, setValidationStatus] =
		useState<ValidationStatus>("idle");
	const [showKey, setShowKey] = useState(false);
	// Store the original preview key value when entering edit mode
	const [originalPreviewKey, setOriginalPreviewKey] = useState<string | null>(null);
	// Track if we started with a preview key (regardless of current value)
	const [startedWithPreview, setStartedWithPreview] = useState(() => {
		return isPreview && value && typeof value === "string" && value.includes("...");
	});
	// Start in editing mode unless we have a preview key
	const [isEditing, setIsEditing] = useState(() => {
		if (isPreview && value && typeof value === "string" && value.includes("...")) {
			return false; // Preview key, start readonly
		}
		return true; // No preview, allow editing
	});
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const onValidationChangeRef = useRef(onValidationChange);

	// Keep ref in sync with prop
	useEffect(() => {
		onValidationChangeRef.current = onValidationChange;
	}, [onValidationChange]);

	// Reset originalPreviewKey when value changes back to preview key externally (e.g., after save)
	useEffect(() => {
		if (
			originalPreviewKey !== null &&
			value &&
			typeof value === "string" &&
			value.includes("...") &&
			value === originalPreviewKey
		) {
			// Value was restored to the original preview key (likely via cancel or external update)
			setOriginalPreviewKey(null);
			setStartedWithPreview(false);
			setIsEditing(false);
		}
	}, [value, originalPreviewKey]);

	// Update startedWithPreview when value prop changes to a preview key
	useEffect(() => {
		if (isPreview && value && typeof value === "string" && value.includes("...")) {
			setStartedWithPreview(true);
		}
	}, [isPreview, value]);

	// Update editing state when isPreview or value changes
	// This effect handles external changes to the value prop, but preserves edit state when user is actively editing
	useEffect(() => {
		// If we're currently editing a preview key (have originalPreviewKey stored), don't interfere
		// This allows the cancel button to remain visible during editing
		if (originalPreviewKey !== null) {
			return;
		}

		if (!isPreview) {
			// Not in preview mode, allow editing
			setIsEditing(true);
		} else if (value && typeof value === "string" && value.includes("...")) {
			// We have a preview key, use readonly mode
			setIsEditing(false);
		} else if (value && typeof value === "string" && !value.includes("...") && value.length >= 20) {
			// Value changed from preview to actual key, allow editing
			setIsEditing(true);
		}
	}, [value, isPreview, originalPreviewKey]);

	useEffect(() => {
		// Clear existing timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = null;
		}

		// Don't validate if no value or provider
		if (!value || !provider || typeof value !== "string") {
			setValidationStatus("idle");
			onValidationChangeRef.current?.(false, "idle");
			return;
		}

		// Don't validate preview keys (from backend) or short keys
		if (value.includes("...") || value.length < 20) {
			setValidationStatus("idle");
			onValidationChangeRef.current?.(false, "idle");
			return;
		}

		// Don't validate if in preview mode and not editing
		if (isPreview && !isEditing) {
			setValidationStatus("idle");
			onValidationChangeRef.current?.(false, "idle");
			return;
		}

		// Mark as pending validation immediately
		setValidationStatus("validating");
		onValidationChangeRef.current?.(false, "validating");

		// Debounce the actual API call
		debounceTimerRef.current = setTimeout(async () => {
			const result = await validateApiKey(provider, value);
			setValidationStatus(result.status);
			onValidationChangeRef.current?.(result.status === "valid", result.status);
		}, 800);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
		};
	}, [value, provider, isPreview, isEditing]);

	const hasValue = value && typeof value === "string" && value.length > 0;
	const isReadonly = isPreview && !isEditing;

	const handleEditClick = () => {
		// Store the original preview key before clearing it
		if (value && typeof value === "string" && value.includes("...")) {
			setOriginalPreviewKey(value);
			setStartedWithPreview(true);
		}
		setIsEditing(true);
		// Clear the preview value so user can enter a new key
		if (onChange && value && typeof value === "string" && value.includes("...")) {
			onChange({
				target: { value: "" },
			} as React.ChangeEvent<HTMLInputElement>);
		}
	};

	const handleCancelClick = () => {
		// Restore the original preview key
		if (originalPreviewKey && onChange) {
			onChange({
				target: { value: originalPreviewKey },
			} as React.ChangeEvent<HTMLInputElement>);
		}
		setOriginalPreviewKey(null);
		setStartedWithPreview(false);
		setIsEditing(false);
		setShowKey(false);
	};

	// Check if we're editing a preview key (have originalPreviewKey stored)
	// Use startedWithPreview instead of isPreview prop, since isPreview changes when value is cleared
	const isEditingPreview = startedWithPreview && isEditing && originalPreviewKey !== null;

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
					// Always reserve space for cancel button when in preview mode to prevent resizing
					startedWithPreview ? "pr-20" : "pr-14",
					isReadonly && "bg-muted cursor-default",
					className,
				)}
			/>
			<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
				{!isReadonly && validationStatus === "validating" && (
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={4}>
							Validating API key...
						</TooltipContent>
					</Tooltip>
				)}
				{!isReadonly && validationStatus === "valid" && (
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={4}>
							API key is valid
						</TooltipContent>
					</Tooltip>
				)}
				{!isReadonly && validationStatus === "invalid" && (
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<XCircle className="h-4 w-4 text-destructive" />
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={4}>
							API key is invalid
						</TooltipContent>
					</Tooltip>
				)}
				{isEditingPreview && (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={handleCancelClick}
								className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
								tabIndex={0}
								aria-label="Cancel editing and restore preview key"
							>
								<RotateCcw className="h-4 w-4" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={4}>
							Cancel editing and restore preview key
						</TooltipContent>
					</Tooltip>
				)}
				{hasValue && (
					<>
						{isReadonly ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										onClick={handleEditClick}
										className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
										tabIndex={0}
										aria-label="Change API key"
									>
										<Edit className="h-4 w-4" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" sideOffset={4}>
									Change API key
								</TooltipContent>
							</Tooltip>
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										onClick={() => setShowKey(!showKey)}
										className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
										tabIndex={-1}
										aria-label={showKey ? "Hide API key" : "Show API key"}
									>
										{showKey ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" sideOffset={4}>
									{showKey ? "Hide API key" : "Show API key"}
								</TooltipContent>
							</Tooltip>
						)}
					</>
				)}
			</div>
		</div>
	);
}

