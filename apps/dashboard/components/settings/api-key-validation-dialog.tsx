"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@recurse/ui/components/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { validateApiKey, type ValidationResult } from "@/lib/validate-api-key";

interface KeyToValidate {
	label: string;
	provider: string;
	apiKey: string;
}

interface ValidationState {
	label: string;
	status: "pending" | "validating" | "valid" | "invalid" | "skipped";
	message?: string;
}

interface ApiKeyValidationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	keysToValidate: KeyToValidate[];
	onValidationComplete: (allValid: boolean) => void;
	onSaveAnyway: () => void;
}

export function ApiKeyValidationDialog({
	open,
	onOpenChange,
	keysToValidate,
	onValidationComplete,
	onSaveAnyway,
}: ApiKeyValidationDialogProps) {
	const [validationStates, setValidationStates] = useState<ValidationState[]>(
		[],
	);
	const [isValidating, setIsValidating] = useState(false);
	const [validationComplete, setValidationComplete] = useState(false);

	// Reset and start validation when dialog opens
	useEffect(() => {
		if (!open) {
			setValidationStates([]);
			setIsValidating(false);
			setValidationComplete(false);
			return;
		}

		// Filter out keys that don't need validation (too short or empty - includes preview keys from backend)
		const validKeys = keysToValidate.filter((key) => {
			if (!key.apiKey || key.apiKey.length < 20) return false;
			return true;
		});

		if (validKeys.length === 0) {
			// No keys to validate, proceed immediately
			onValidationComplete(true);
			return;
		}

		// Initialize states
		const initialStates: ValidationState[] = validKeys.map((key) => ({
			label: key.label,
			status: "pending",
		}));
		setValidationStates(initialStates);
		setIsValidating(true);

		// Validate all keys
		async function validateAll() {
			const results: ValidationState[] = [];

			for (let i = 0; i < validKeys.length; i++) {
				const key = validKeys[i];

				// Update state to show we're validating this key
				setValidationStates((prev) =>
					prev.map((s, idx) =>
						idx === i ? { ...s, status: "validating" } : s,
					),
				);

				// Small delay for visual feedback
				await new Promise((resolve) => setTimeout(resolve, 300));

				const result = await validateApiKey(key.provider, key.apiKey);

				const newState: ValidationState = {
					label: key.label,
					status: result.status === "valid" ? "valid" : "invalid",
					message: result.message,
				};

				results.push(newState);

				// Update the state immediately after each validation
				setValidationStates((prev) =>
					prev.map((s, idx) => (idx === i ? newState : s)),
				);
			}

			setIsValidating(false);
			setValidationComplete(true);

			// Check if all valid
			const allValid = results.every((r) => r.status === "valid");
			if (allValid) {
				// Auto-proceed after a short delay
				setTimeout(() => {
					onValidationComplete(true);
				}, 800);
			}
		}

		validateAll();
	}, [open, keysToValidate, onValidationComplete]);

	const hasInvalidKeys = validationStates.some((s) => s.status === "invalid");
	const allValid = validationComplete && !hasInvalidKeys;

	const getStatusIcon = (status: ValidationState["status"]) => {
		switch (status) {
			case "pending":
				return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
			case "validating":
				return (
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				);
			case "valid":
				return <CheckCircle2 className="h-5 w-5 text-green-600" />;
			case "invalid":
				return <XCircle className="h-5 w-5 text-destructive" />;
			case "skipped":
				return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={!isValidating}>
				<DialogHeader>
					<DialogTitle>
						{isValidating
							? "Validating API Keys..."
							: allValid
								? "API Keys Valid"
								: "Validation Results"}
					</DialogTitle>
					<DialogDescription>
						{isValidating
							? "Please wait while we verify your API keys with the providers."
							: allValid
								? "All API keys are valid. Saving your settings..."
								: "Some API keys could not be validated."}
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<AnimatePresence mode="wait">
						<motion.div
							className="space-y-3"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							{validationStates.map((state, idx) => (
								<motion.div
									key={state.label}
									className="flex items-start gap-3 rounded-lg border p-3"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: idx * 0.1 }}
								>
									<div className="mt-0.5">{getStatusIcon(state.status)}</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm">{state.label}</div>
										{state.message && (
											<p
												className={`text-xs mt-0.5 ${
													state.status === "invalid"
														? "text-destructive"
														: state.status === "valid"
															? "text-green-600"
															: "text-muted-foreground"
												}`}
											>
												{state.message}
											</p>
										)}
									</div>
								</motion.div>
							))}
						</motion.div>
					</AnimatePresence>
				</div>

				{validationComplete && hasInvalidKeys && (
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Go Back & Fix
						</Button>
						<Button
							variant="destructive"
							onClick={onSaveAnyway}
						>
							Save Anyway
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}

