"use client";

import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { validateApiKey, type ValidationStatus } from "@/lib/validate-api-key";
import { cn } from "@/lib/utils";

interface ApiKeyInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
	provider: string;
	onValidationChange?: (isValid: boolean, status: ValidationStatus) => void;
}

export function ApiKeyInput({
	provider,
	onValidationChange,
	className,
	value,
	onChange,
	...props
}: ApiKeyInputProps) {
	const [validationStatus, setValidationStatus] =
		useState<ValidationStatus>("idle");
	const [showKey, setShowKey] = useState(false);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const onValidationChangeRef = useRef(onValidationChange);

	// Keep ref in sync with prop
	useEffect(() => {
		onValidationChangeRef.current = onValidationChange;
	}, [onValidationChange]);

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
	}, [value, provider]);

	const hasValue = value && typeof value === "string" && value.length > 0;

	return (
		<div className="relative">
			<Input
				{...props}
				type={showKey ? "text" : "password"}
				value={value}
				onChange={onChange}
				className={cn("pr-14", className)}
			/>
			<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
				{validationStatus === "validating" && (
					<Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
				)}
				{validationStatus === "valid" && (
					<CheckCircle2 className="h-4 w-4 text-green-600" />
				)}
				{validationStatus === "invalid" && (
					<XCircle className="h-4 w-4 text-destructive" />
				)}
				{hasValue && (
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
				)}
			</div>
		</div>
	);
}

