"use client";

import { EMBEDDING_MODEL, PARSING_MODELS } from "@recurse/config/models";
import {
	Combobox,
	type ComboboxOption,
} from "@recurse/ui/components/combobox";
import { ChevronsUpDownIcon, HelpCircle, Info } from "lucide-react";
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
	getUserSettings,
	updateUserSettings,
	type UserSettings,
} from "@/lib/user-settings";
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

	// Load existing settings from backend on mount
	useEffect(() => {
		async function loadSettings() {
			try {
				setLoadingKeys(true);
				const settings = await getUserSettings();

				// Map new API structure to current state
				const updates: Partial<typeof initialState> = {};

				// Set models from new API structure
				if (settings.models?.extraction) {
					updates.defaultParsingModel = settings.models.extraction;
				}
				if (settings.models?.writing) {
					updates.contextModel = settings.models.writing;
				}

				// Determine which provider keys to use
				// Prefer openrouter if configured (covers all models), otherwise fall back to openai
				const openrouterKey = settings.api_keys?.openrouter;
				const openaiKey = settings.api_keys?.openai;

				// For parsing model: use openrouter if configured, otherwise openai
				if (openrouterKey?.configured && openrouterKey.preview) {
					updates.provider = "openrouter";
					updates.parsingModelApiKey = openrouterKey.preview;
				} else if (openaiKey?.configured && openaiKey.preview) {
					updates.provider = "openai";
					updates.parsingModelApiKey = openaiKey.preview;
				}

				// For context model: use openrouter if configured, otherwise openai
				if (openrouterKey?.configured && openrouterKey.preview) {
					updates.contextProvider = "openrouter";
					updates.contextModelApiKey = openrouterKey.preview;
				} else if (openaiKey?.configured && openaiKey.preview) {
					updates.contextProvider = "openai";
					updates.contextModelApiKey = openaiKey.preview;
				}

				if (Object.keys(updates).length > 0) {
					setState((prev) => {
						const newState = { ...prev, ...updates };
						setBaseline(newState);
						return newState;
					});
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
			// Build update request with only changed fields
			const updateRequest: {
				models?: { writing?: string; extraction?: string };
				api_keys?: {
					openrouter?: string;
					openai?: string;
					anthropic?: string;
					google?: string;
				};
			} = {};

			// Check for model changes
			const parsingModelChanged =
				state.defaultParsingModel !== baseline.defaultParsingModel;
			const contextModelChanged =
				state.contextModel !== baseline.contextModel;

			if (parsingModelChanged || contextModelChanged) {
				updateRequest.models = {};
				if (parsingModelChanged && state.defaultParsingModel) {
					updateRequest.models.extraction = state.defaultParsingModel;
				}
				if (contextModelChanged && state.contextModel) {
					updateRequest.models.writing = state.contextModel;
				}
			}

			// Check for API key changes
			const parsingKeyChanged =
				state.parsingModelApiKey !== baseline.parsingModelApiKey;
			const contextKeyChanged =
				state.contextModelApiKey !== baseline.contextModelApiKey;

			// Determine if keys are previews (not user-entered)
			const parsingKeyIsPreview =
				!!baseline.parsingModelApiKey &&
				state.parsingModelApiKey === baseline.parsingModelApiKey;
			const contextKeyIsPreview =
				!!baseline.contextModelApiKey &&
				state.contextModelApiKey === baseline.contextModelApiKey;

			// Only include API keys if they changed and are not previews (user entered new key)
			if (parsingKeyChanged && !parsingKeyIsPreview && state.parsingModelApiKey) {
				if (!updateRequest.api_keys) {
					updateRequest.api_keys = {};
				}
				// Map provider to API key field
				if (state.provider === "openrouter") {
					updateRequest.api_keys.openrouter = state.parsingModelApiKey;
				} else if (state.provider === "openai") {
					updateRequest.api_keys.openai = state.parsingModelApiKey;
				}
			}

			if (contextKeyChanged && !contextKeyIsPreview && state.contextModelApiKey) {
				if (!updateRequest.api_keys) {
					updateRequest.api_keys = {};
				}
				// Map provider to API key field
				if (state.contextProvider === "openrouter") {
					updateRequest.api_keys.openrouter = state.contextModelApiKey;
				} else if (state.contextProvider === "openai") {
					updateRequest.api_keys.openai = state.contextModelApiKey;
				}
			}

			// Only send request if there are changes
			if (
				Object.keys(updateRequest.models || {}).length > 0 ||
				Object.keys(updateRequest.api_keys || {}).length > 0
			) {
				// Update settings via unified API
				await updateUserSettings(updateRequest);

				// Reload settings to get updated previews for all providers
				const updatedSettings = await getUserSettings();

				// Update baseline with new settings
				const newBaseline = { ...state };

				// Update models from response
				if (updatedSettings.models?.extraction) {
					newBaseline.defaultParsingModel = updatedSettings.models.extraction;
				}
				if (updatedSettings.models?.writing) {
					newBaseline.contextModel = updatedSettings.models.writing;
				}

				// Update API key previews from response based on selected providers
				if (state.provider === "openrouter" && updatedSettings.api_keys?.openrouter?.preview) {
					newBaseline.parsingModelApiKey = updatedSettings.api_keys.openrouter.preview;
				} else if (state.provider === "openai" && updatedSettings.api_keys?.openai?.preview) {
					newBaseline.parsingModelApiKey = updatedSettings.api_keys.openai.preview;
				} else {
					// If provider doesn't have a configured key, clear the preview
					newBaseline.parsingModelApiKey = "";
				}

				if (state.contextProvider === "openrouter" && updatedSettings.api_keys?.openrouter?.preview) {
					newBaseline.contextModelApiKey = updatedSettings.api_keys.openrouter.preview;
				} else if (state.contextProvider === "openai" && updatedSettings.api_keys?.openai?.preview) {
					newBaseline.contextModelApiKey = updatedSettings.api_keys.openai.preview;
				} else {
					// If provider doesn't have a configured key, clear the preview
					newBaseline.contextModelApiKey = "";
				}

				setBaseline(newBaseline);
				// Update state to match baseline (so UI shows previews)
				setState(newBaseline);
			}

			// Show success toast
			toast.success("Settings saved successfully");
		} catch (error) {
			console.error("[Settings] Failed to save settings:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to save settings. Please try again.";
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
													modelType="parsing"
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
													modelType="context"
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

							{/* Embedding Model */}
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
												<Info className="size-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent
											className="max-w-[260px]"
											side="top"
											sideOffset={4}
										>
											We currently support only one embedding model.
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
