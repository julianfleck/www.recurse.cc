"use client";

import { EMBEDDING_MODEL, PARSING_MODELS } from "@recurse/config/models";
import {
	Combobox,
	type ComboboxOption,
} from "@recurse/ui/components/combobox";
import { ChevronsUpDownIcon, HelpCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/components/auth/auth-store";
import { ApiKeyInput } from "@/components/ui/api-key-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@recurse/ui/components/dialog";
import {
	getModelApiKeys,
	updateModelApiKey,
	upsertModelApiKey,
	type UserModelApiKey,
} from "@/lib/model-api-keys";
import { apiService } from "@/lib/api";
import type { AvailableModel } from "@/lib/models/types";
import { ModelCombobox } from "@/components/ui/model-combobox";

export default function SettingsPage() {
	// Seed defaults (could be loaded from API/local storage later)
	const authUser = useAuthStore((s) => s.user);

	const initialState = useMemo(
		() => ({
			defaultParsingModel: "",
			parsingModelApiKey: "",
			contextModel: "",
			contextModelApiKey: "",
			contextProvider: "openai",
			embeddingModel: EMBEDDING_MODEL.value,
			email: authUser?.email ?? "",
			password: "",
			provider: "openai",
		}),
		[authUser?.email],
	);

	const [state, setState] = useState(initialState);
	const [baseline, setBaseline] = useState(initialState);
	const [saving, setSaving] = useState(false);
	const [loadingKeys, setLoadingKeys] = useState(true);
	const [parsingKeyValid, setParsingKeyValid] = useState(false);
	const [parsingKeyStatus, setParsingKeyStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
	const [contextKeyValid, setContextKeyValid] = useState(false);
	const [contextKeyStatus, setContextKeyStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
	const [showValidationDialog, setShowValidationDialog] = useState(false);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	const providers: ComboboxOption[] = [
		{ value: "openai", label: "OpenAI" },
		{ value: "openrouter", label: "OpenRouter" },
	];

	const [loadingModels, setLoadingModels] = useState(false);
	const [modelsError, setModelsError] = useState("");
	const [fetchedModels, setFetchedModels] = useState<AvailableModel[]>([]);

	const [loadingContextModels, setLoadingContextModels] = useState(false);
	const [contextModelsError, setContextModelsError] = useState("");
	const [fetchedContextModels, setFetchedContextModels] = useState<
		AvailableModel[]
	>([]);

	useEffect(() => {
		// If auth user changes (e.g. after login), re-seed email baseline/state
		setState((prev) => ({ ...prev, email: authUser?.email ?? "" }));
		setBaseline((prev) => ({ ...prev, email: authUser?.email ?? "" }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authUser?.email]);

	// Fetch models that support structured output (for extraction/parsing)
	useEffect(() => {
		let cancelled = false;

		setLoadingModels(true);
		setModelsError("");

		// Use backend API that returns models with structured output support
		apiService
			.get<{ models: AvailableModel[]; total: number }>(
				"/users/me/available-models",
				{
					supports_structured_output: true,
				},
			)
			.then((response) => {
				if (cancelled) return;
				const models = (response.data.models || []).filter(
					(m) => m.supports_structured_output,
				);
				setFetchedModels(models);
			})
			.catch((err) => {
				if (cancelled) return;
				setModelsError(err.message || "Failed to load models");
				setFetchedModels([]);
			})
			.finally(() => {
				if (cancelled) return;
				setLoadingModels(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	// Fetch models for context/writing (same list, still filtered to those
	// that support structured output so both fields stay in sync)
	useEffect(() => {
		let cancelled = false;

		setLoadingContextModels(true);
		setContextModelsError("");

		apiService
			.get<{ models: AvailableModel[]; total: number }>(
				"/users/me/available-models",
				{
					supports_structured_output: true,
				},
			)
			.then((response) => {
				if (cancelled) return;
				const models = (response.data.models || []).filter(
					(m) => m.supports_structured_output,
				);
				setFetchedContextModels(models);
			})
			.catch((err) => {
				if (cancelled) return;
				setContextModelsError(err.message || "Failed to load models");
				setFetchedContextModels([]);
			})
			.finally(() => {
				if (cancelled) return;
				setLoadingContextModels(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const currentModels = fetchedModels;
	const currentContextModels = fetchedContextModels;

	// A key is a "preview" if it matches what was loaded from the backend (baseline)
	// The backend always returns preview keys in the key_preview field
	const parsingKeyIsPreview = !!baseline.parsingModelApiKey && 
		state.parsingModelApiKey === baseline.parsingModelApiKey;
	const contextKeyIsPreview = !!baseline.contextModelApiKey && 
		state.contextModelApiKey === baseline.contextModelApiKey;

	// Compute if there are actual saveable changes
	const canSave = useMemo(() => {
		// Check for any differences from baseline
		const hasChanges = JSON.stringify(state) !== JSON.stringify(baseline);
		if (!hasChanges) return false;

		// Check parsing key: if changed, must be validated and model selected
		const parsingKeyChanged = state.parsingModelApiKey !== baseline.parsingModelApiKey;
		if (parsingKeyChanged) {
			// If key was cleared (user clicked edit but didn't enter anything), can't save
			if (!state.parsingModelApiKey) return false;
			// New key must be validated
			if (parsingKeyStatus !== "valid") return false;
			// Model must be selected for new key
			if (!state.defaultParsingModel) return false;
		}

		// Check context key: if changed, must be validated and model selected
		const contextKeyChanged = state.contextModelApiKey !== baseline.contextModelApiKey;
		if (contextKeyChanged) {
			// If key was cleared (user clicked edit but didn't enter anything), can't save
			if (!state.contextModelApiKey) return false;
			// New key must be validated
			if (contextKeyStatus !== "valid") return false;
			// Model must be selected for new key
			if (!state.contextModel) return false;
		}

		// If only model changed (key is preview), that's valid
		const parsingModelChanged = state.defaultParsingModel !== baseline.defaultParsingModel;
		const contextModelChanged = state.contextModel !== baseline.contextModel;
		
		// At least one meaningful change must exist
		return parsingKeyChanged || contextKeyChanged || parsingModelChanged || contextModelChanged ||
			state.email !== baseline.email || state.password !== baseline.password;
	}, [state, baseline, parsingKeyStatus, contextKeyStatus]);

	const parsingModelPlaceholder = useMemo(() => {
		if (!state.parsingModelApiKey) {
			return "← Enter API key";
		}
		// Preview key - show appropriate message
		if (parsingKeyIsPreview) {
			return "Select model";
		}
		if (state.parsingModelApiKey.length < 20) {
			return "← Enter full API key";
		}
		if (parsingKeyStatus === "validating") {
			return "⏳ Verifying key...";
		}
		if (parsingKeyStatus === "invalid") {
			return "❌ Invalid API key";
		}
		if (parsingKeyStatus === "valid" && loadingModels) {
			return "✓ Key valid, loading models...";
		}
		if (parsingKeyStatus === "valid" && modelsError) {
			return "✓ Key valid, error loading models";
		}
		if (parsingKeyStatus === "valid") {
			return "✓ Key valid — select model";
		}
		return "← Enter API key";
	}, [state.parsingModelApiKey, parsingKeyStatus, loadingModels, modelsError]);

	const contextModelPlaceholder = useMemo(() => {
		if (!state.contextModelApiKey) {
			return "← Enter API key";
		}
		// Preview key - show appropriate message
		if (contextKeyIsPreview) {
			return "Select model";
		}
		if (state.contextModelApiKey.length < 20) {
			return "← Enter full API key";
		}
		if (contextKeyStatus === "validating") {
			return "⏳ Verifying key...";
		}
		if (contextKeyStatus === "invalid") {
			return "❌ Invalid API key";
		}
		if (contextKeyStatus === "valid" && loadingContextModels) {
			return "✓ Key valid, loading models...";
		}
		if (contextKeyStatus === "valid" && contextModelsError) {
			return "✓ Key valid, error loading models";
		}
		if (contextKeyStatus === "valid") {
			return "✓ Key valid — select model";
		}
		return "← Enter API key";
	}, [state.contextModelApiKey, contextKeyStatus, loadingContextModels, contextModelsError]);

	const parsingModelsForUI: AvailableModel[] = useMemo(() => {
		// If we have fetched models from the backend, use those
		if (currentModels.length > 0) {
			return currentModels;
		}

		// If we have a preview key (can't fetch models), use fallback list
		if (parsingKeyIsPreview) {
			const fallbackModels: AvailableModel[] = PARSING_MODELS.map((m) => ({
				id: m.value,
				name: m.label,
			}));

			// Include currently selected model if not in fallback list
			if (
				state.defaultParsingModel &&
				!fallbackModels.some((m) => m.id === state.defaultParsingModel)
			) {
				fallbackModels.unshift({
					id: state.defaultParsingModel,
					name: state.defaultParsingModel,
				});
			}

			return fallbackModels;
		}

		return [];
	}, [currentModels, parsingKeyIsPreview, state.defaultParsingModel]);

	const contextModelsForUI: AvailableModel[] = useMemo(() => {
		// If we have fetched models from the backend, use those
		if (currentContextModels.length > 0) {
			return currentContextModels;
		}

		// If we have a preview key (can't fetch models), use fallback list
		if (contextKeyIsPreview) {
			const fallbackModels: AvailableModel[] = PARSING_MODELS.map((m) => ({
				id: m.value,
				name: m.label,
			}));

			// Include currently selected model if not in fallback list
			if (
				state.contextModel &&
				!fallbackModels.some((m) => m.id === state.contextModel)
			) {
				fallbackModels.unshift({
					id: state.contextModel,
					name: state.contextModel,
				});
			}

			return fallbackModels;
		}

		return [];
	}, [currentContextModels, contextKeyIsPreview, state.contextModel]);

	// Load existing API keys and settings from backend on mount
	useEffect(() => {
		async function loadSettings() {
			try {
				setLoadingKeys(true);
				const keys = await getModelApiKeys();

			// Filter to only active keys
			const activeKeys = keys.filter((k) => k.is_active);

			// Try to load key IDs from localStorage (set when we save)
			const savedParsingKeyId = typeof window !== "undefined" 
				? localStorage.getItem("settings_parsing_key_id")
				: null;
			const savedContextKeyId = typeof window !== "undefined"
				? localStorage.getItem("settings_context_key_id")
				: null;

			// Find keys by saved IDs first, then fall back to heuristics
			let parsingKey = savedParsingKeyId
				? activeKeys.find((k) => k.id === savedParsingKeyId && k.is_active)
				: null;
			let contextKey = savedContextKeyId
				? activeKeys.find((k) => k.id === savedContextKeyId && k.is_active)
				: null;

			// Fallback: if saved IDs don't exist or keys are inactive, use heuristics
			if (!parsingKey) {
				const keysWithModels = activeKeys.filter((k) => k.model_pattern);
				const keysWithoutModels = activeKeys.filter((k) => !k.model_pattern);

				// For parsing model: prefer key with model_pattern, fallback to any active key
				parsingKey =
					keysWithModels.find((k) => k.provider === "openai") ||
					keysWithModels[0] ||
					keysWithoutModels.find((k) => k.provider === "openai") ||
					keysWithoutModels[0];
			}

			if (!contextKey) {
				const keysWithModels = activeKeys.filter((k) => k.model_pattern);
				const keysWithoutModels = activeKeys.filter((k) => !k.model_pattern);

				// For context model: prefer different key than parsing, or same if only one exists
				contextKey =
					keysWithModels.find(
						(k) => k.id !== parsingKey?.id && k.provider === "openai",
					) ||
					keysWithModels.find((k) => k.id !== parsingKey?.id) ||
					keysWithModels[0] ||
					keysWithoutModels.find((k) => k.id !== parsingKey?.id) ||
					keysWithoutModels[0];
			}

				// Update state with loaded keys
				const updates: Partial<typeof initialState> = {};

				if (parsingKey) {
					updates.provider = parsingKey.provider;
					updates.parsingModelApiKey = parsingKey.key_preview;
					updates.defaultParsingModel = parsingKey.model_pattern || "";
				}

				if (contextKey) {
					updates.contextProvider = contextKey.provider;
					updates.contextModelApiKey = contextKey.key_preview;
					updates.contextModel = contextKey.model_pattern || "";
				}

				if (Object.keys(updates).length > 0) {
					setState((prev) => {
						const newState = { ...prev, ...updates };
						setBaseline(newState);
						return newState;
					});

					// Try to load models for the keys we found
					// Note: We can't use the preview key to fetch models, so we'll skip model loading
					// The user will need to enter a new key if they want to change the model
					// But if model_pattern is set, we at least know which model was selected
				}
			} catch (error) {
				console.error("[Settings] Failed to load settings:", error);
				// Don't show error to user - they can still enter keys manually
			} finally {
				setLoadingKeys(false);
			}
		}

		loadSettings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Validate that API keys have corresponding model selections
	const validateBeforeSave = useCallback(() => {
		const errors: string[] = [];

		// Check parsing model: if API key is provided (and not a preview), model must be selected
		const hasParsingKey =
			state.parsingModelApiKey &&
			!parsingKeyIsPreview &&
			state.parsingModelApiKey.length >= 20;
		if (hasParsingKey && !state.defaultParsingModel) {
			errors.push("Parsing Model: Please select a model for your API key");
		}

		// Check context model: if API key is provided (and not a preview), model must be selected
		const hasContextKey =
			state.contextModelApiKey &&
			!contextKeyIsPreview &&
			state.contextModelApiKey.length >= 20;
		if (hasContextKey && !state.contextModel) {
			errors.push("Context Model: Please select a model for your API key");
		}

		return errors;
	}, [state, parsingKeyIsPreview, contextKeyIsPreview]);

	// Handle save button click
	const handleSave = useCallback(async () => {
		// Validate before saving
		const validationErrors = validateBeforeSave();
		if (validationErrors.length > 0) {
			setValidationErrors(validationErrors);
			setShowValidationDialog(true);
			return;
		}

		setSaving(true);

		try {
			// Load keys once at the start to avoid stale data
			const currentKeys = await getModelApiKeys();

			// Save parsing model settings if API key changed OR model changed
			const parsingKeyChanged =
				state.parsingModelApiKey !== baseline.parsingModelApiKey;
			const parsingModelChanged =
				state.defaultParsingModel !== baseline.defaultParsingModel;
			if (
				state.parsingModelApiKey &&
				state.defaultParsingModel &&
				(parsingKeyChanged || parsingModelChanged)
			) {
				// Key is a preview if it matches what was loaded from the backend
				const isPreview =
					(!!baseline.parsingModelApiKey && state.parsingModelApiKey === baseline.parsingModelApiKey) ||
					(typeof state.parsingModelApiKey === "string" && state.parsingModelApiKey.length < 20);

				// Find the existing key by provider + baseline model_pattern
				const existingParsingKey = currentKeys.find(
					(k) =>
						k.provider === state.provider &&
						k.is_active &&
						(baseline.defaultParsingModel
							? k.model_pattern === baseline.defaultParsingModel
							: (!!baseline.parsingModelApiKey && state.parsingModelApiKey === baseline.parsingModelApiKey) &&
								k.key_preview === state.parsingModelApiKey),
				);

				if (existingParsingKey) {
					// Update existing key
					await updateModelApiKey(existingParsingKey.id, {
						...(isPreview ? {} : { api_key: state.parsingModelApiKey }),
						model_pattern: state.defaultParsingModel,
					});
				} else if (!isPreview) {
					// Create new key if we have a full API key and no existing key found
					await upsertModelApiKey(
						state.provider,
						state.parsingModelApiKey,
						state.defaultParsingModel,
					);
				}
			}

			// Save context model settings if API key changed OR model changed
			const contextKeyChanged =
				state.contextModelApiKey !== baseline.contextModelApiKey;
			const contextModelChanged =
				state.contextModel !== baseline.contextModel;
			if (
				state.contextModelApiKey &&
				state.contextModel &&
				(contextKeyChanged || contextModelChanged)
			) {
				// Key is a preview if it matches what was loaded from the backend
			const isPreview =
					(!!baseline.contextModelApiKey && state.contextModelApiKey === baseline.contextModelApiKey) ||
					(typeof state.contextModelApiKey === "string" && state.contextModelApiKey.length < 20);

				// Reload keys after parsing save to get fresh data
				const refreshedKeys = await getModelApiKeys();

				// Find the existing key by provider + baseline model_pattern
				// This ensures we update the correct key even if parsing and context share the same API key
				// Fallback to key_preview match if baseline model_pattern is not available
				const existingContextKey = refreshedKeys.find(
					(k) =>
						k.provider === state.contextProvider &&
						k.is_active &&
						(baseline.contextModel
							? k.model_pattern === baseline.contextModel
							: (!!baseline.contextModelApiKey && state.contextModelApiKey === baseline.contextModelApiKey) &&
								k.key_preview === state.contextModelApiKey),
				);

				if (existingContextKey) {
					// Update existing key (it's fine if this is the same key as parsing - user can use same key for both)
					await updateModelApiKey(existingContextKey.id, {
						...(isPreview ? {} : { api_key: state.contextModelApiKey }),
						model_pattern: state.contextModel,
					});
				} else if (!isPreview) {
					// Create new key if we have a full API key and no existing key found
					await upsertModelApiKey(
						state.contextProvider,
						state.contextModelApiKey,
						state.contextModel,
					);
				}
			}

			// Reload keys to get updated previews
			const keys = await getModelApiKeys();
			const parsingKey = keys.find(
				(k) =>
					k.provider === state.provider &&
					k.is_active &&
					k.model_pattern === state.defaultParsingModel,
			);
			const contextKey = keys.find(
				(k) =>
					k.provider === state.contextProvider &&
					k.is_active &&
					k.model_pattern === state.contextModel,
			);

			// Store key IDs in localStorage so we can load them correctly next time
			if (parsingKey) {
				localStorage.setItem("settings_parsing_key_id", parsingKey.id);
			}
			if (contextKey) {
				localStorage.setItem("settings_context_key_id", contextKey.id);
			}

			// Update baseline with saved state (using previews if available)
			setBaseline({
				...state,
				parsingModelApiKey: parsingKey?.key_preview || state.parsingModelApiKey,
				contextModelApiKey: contextKey?.key_preview || state.contextModelApiKey,
			});

			// Show success toast
			toast.success("Settings saved successfully");
		} catch (error) {
			console.error("[Settings] Failed to save API keys:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to save API keys. Please try again.";
			toast.error("Failed to save settings", {
				description: errorMessage,
			});
		} finally {
			setSaving(false);
		}
	}, [state, baseline, validateBeforeSave]);

	return (
		<div
			className="flex flex-col"
			style={{ minHeight: "calc(100vh - var(--fd-nav-height))" }}
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
									{loadingKeys ? (
										<div className="flex flex-col items-stretch gap-2 sm:flex-row">
											<Skeleton className="h-9 sm:flex-1" />
											<Skeleton className="h-9 sm:flex-1" />
											<Skeleton className="h-9 sm:flex-1" />
										</div>
									) : (
										<div className="flex flex-col items-stretch gap-2 sm:flex-row">
											<div className="flex items-center gap-2 sm:flex-1 min-w-0">
												<Combobox
													options={providers}
													value={state.provider}
													onValueChange={(value) => {
														const providerValue =
															typeof value === "string" ? value : value[0];
														setState((s) => {
															// Only copy if provider matches context provider and parsing key is empty
															// Context key is not a preview if it differs from baseline
															const contextIsNotPreview = s.contextModelApiKey !== baseline.contextModelApiKey;
															const shouldCopy =
																providerValue === s.contextProvider &&
																s.contextModelApiKey &&
																contextIsNotPreview &&
																s.contextModelApiKey.length >= 20 &&
																!s.parsingModelApiKey;
															return {
																...s,
																provider: providerValue,
																defaultParsingModel: "",
																...(shouldCopy && {
																	parsingModelApiKey: s.contextModelApiKey,
																}),
															};
														});
													}}
													placeholder="Select provider..."
													emptyMessage="No providers found."
													searchPlaceholder="Search providers..."
													className="flex-1 min-w-0"
												/>
											</div>
											<ApiKeyInput
												className="sm:flex-1"
												id="parsing-model-api-key-inline"
												provider={state.provider}
												isPreview={parsingKeyIsPreview}
												onValidationChange={(isValid, status) => {
													setParsingKeyValid(isValid);
													setParsingKeyStatus(status);
												}}
												onChange={(e) => {
													const newKey = e.target.value;
													setState((s) => {
														// Only copy if providers match and context key is empty
														const shouldCopy =
															s.provider === s.contextProvider &&
															!s.contextModelApiKey;
														return {
															...s,
															parsingModelApiKey: newKey,
															...(shouldCopy && {
																contextModelApiKey: newKey,
															}),
														};
													});
												}}
												placeholder="Enter API key"
												value={state.parsingModelApiKey}
											/>
											<div className="flex items-center gap-2 sm:flex-1 min-w-0">
												<ModelCombobox
													models={parsingModelsForUI}
													value={state.defaultParsingModel}
													onValueChange={(modelId) => {
														setState((s) => ({
															...s,
															defaultParsingModel: modelId,
														}));
													}}
													placeholder={parsingModelPlaceholder}
													disabled={Boolean(
														!state.parsingModelApiKey ||
															// Disable if key is not preview AND not valid
															(!parsingKeyIsPreview &&
																!parsingKeyValid) ||
															parsingKeyStatus === "validating" ||
															loadingModels ||
															modelsError,
													)}
													className="flex-1 min-w-0"
												/>
											</div>
										</div>
									)}
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
									{loadingKeys ? (
										<div className="flex flex-col items-stretch gap-2 sm:flex-row">
											<Skeleton className="h-9 sm:flex-1" />
											<Skeleton className="h-9 sm:flex-1" />
											<Skeleton className="h-9 sm:flex-1" />
										</div>
									) : (
										<div className="flex flex-col items-stretch gap-2 sm:flex-row">
											<div className="flex items-center gap-2 sm:flex-1 min-w-0">
												<Combobox
													options={providers}
													value={state.contextProvider}
													onValueChange={(value) => {
														const providerValue =
															typeof value === "string" ? value : value[0];
														setState((s) => {
															// Only copy if provider matches parsing provider and context key is empty
															// Parsing key is not a preview if it differs from baseline
															const parsingIsNotPreview = s.parsingModelApiKey !== baseline.parsingModelApiKey;
															const shouldCopy =
																providerValue === s.provider &&
																s.parsingModelApiKey &&
																parsingIsNotPreview &&
																s.parsingModelApiKey.length >= 20 &&
																!s.contextModelApiKey;
															return {
																...s,
																contextProvider: providerValue,
																contextModel: "",
																...(shouldCopy && {
																	contextModelApiKey: s.parsingModelApiKey,
																}),
															};
														});
													}}
													placeholder="Select provider..."
													emptyMessage="No providers found."
													searchPlaceholder="Search providers..."
													className="flex-1 min-w-0"
												/>
											</div>
											<ApiKeyInput
												className="sm:flex-1"
												id="context-model-api-key-inline"
												provider={state.contextProvider}
												isPreview={contextKeyIsPreview}
												onValidationChange={(isValid, status) => {
													setContextKeyValid(isValid);
													setContextKeyStatus(status);
												}}
												onChange={(e) => {
													const newKey = e.target.value;
													setState((s) => {
														// Only copy if providers match and parsing key is empty
														const shouldCopy =
															s.provider === s.contextProvider &&
															!s.parsingModelApiKey;
														return {
															...s,
															contextModelApiKey: newKey,
															...(shouldCopy && {
																parsingModelApiKey: newKey,
															}),
														};
													});
												}}
												placeholder="Enter API key"
												value={state.contextModelApiKey}
											/>
											<div className="flex items-center gap-2 sm:flex-1 min-w-0">
												<ModelCombobox
													models={contextModelsForUI}
													value={state.contextModel}
													onValueChange={(modelId) => {
														setState((s) => ({
															...s,
															contextModel: modelId,
														}));
													}}
													placeholder={contextModelPlaceholder}
													disabled={Boolean(
														!state.contextModelApiKey ||
															// Disable if key is not preview AND not valid
															(!contextKeyIsPreview &&
																!contextKeyValid) ||
															contextKeyStatus === "validating" ||
															loadingContextModels ||
															contextModelsError,
													)}
													className="flex-1 min-w-0"
												/>
											</div>
										</div>
									)}
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
										className="flex-1 justify-between"
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
									{loadingKeys ? (
										<Skeleton className="h-9" />
									) : (
										<Input
											id="email"
											onChange={(e) =>
												setState((s) => ({ ...s, email: e.target.value }))
											}
											placeholder="you@example.com"
											type="email"
											value={state.email}
										/>
									)}
								</div>
							</div>

							{/* Password */}
							<div className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-3">
								<Label className="text-muted-foreground" htmlFor="password">
									Passwort
								</Label>
								<div className="sm:col-span-2">
									{loadingKeys ? (
										<Skeleton className="h-9" />
									) : (
										<Input
											id="password"
											onChange={(e) =>
												setState((s) => ({ ...s, password: e.target.value }))
											}
											placeholder="Set a new password"
											type="password"
											value={state.password}
										/>
									)}
								</div>
							</div>
						</div>
					</section>
				</div>

				{/* Footer */}
				<div className="mt-10 flex justify-end">
					<Button
						disabled={!canSave || saving || loadingKeys}
						onClick={handleSave}
						type="button"
					>
						{saving ? "Saving..." : "Save changes"}
					</Button>
				</div>
			</div>

			{/* Validation Dialog */}
			<Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Missing Model Selection</DialogTitle>
						<DialogDescription>
							You've provided API keys but haven't selected corresponding models.
							Please select a model for each API key you've entered.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<ul className="list-disc list-inside space-y-2">
							{validationErrors.map((error, idx) => (
								<li key={idx} className="text-sm text-muted-foreground">
									{error}
								</li>
							))}
						</ul>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowValidationDialog(false)}
						>
							Go Back
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
