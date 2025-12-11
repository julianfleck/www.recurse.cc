"use client";

import {
	EMBEDDING_MODEL,
	type ModelOption,
	PARSING_MODELS,
} from "@recurse/config/models";
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
	upsertModelApiKey,
	type UserModelApiKey,
} from "@/lib/model-api-keys";

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
	const [saveError, setSaveError] = useState<string | null>(null);
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
	const [fetchedModels, setFetchedModels] = useState<ModelOption[]>([]);

	const [loadingContextModels, setLoadingContextModels] = useState(false);
	const [contextModelsError, setContextModelsError] = useState("");
	const [fetchedContextModels, setFetchedContextModels] = useState<
		ModelOption[]
	>([]);

	useEffect(() => {
		// If auth user changes (e.g. after login), re-seed email baseline/state
		setState((prev) => ({ ...prev, email: authUser?.email ?? "" }));
		setBaseline((prev) => ({ ...prev, email: authUser?.email ?? "" }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authUser?.email]);

	useEffect(() => {
		if (!state.parsingModelApiKey) {
			setFetchedModels([]);
			setModelsError("");
			return;
		}

		setLoadingModels(true);
		setModelsError("");

		fetch("/api/models", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				provider: state.provider,
				apiKey: state.parsingModelApiKey,
			}),
		})
			.then((res) => {
				if (!res.ok) {
					return res.json().then((errorData) => {
						throw new Error(errorData.error || `Failed to fetch models: ${res.statusText}`);
					});
				}
				return res.json();
			})
			.then((data) => {
				// API returns { data: [{ value: string, label: string }] }
				const models = (data.data || []).map((m: { value: string; label: string }) => ({
					value: m.value,
					label: m.label,
				})) as ModelOption[];
				setFetchedModels(models);
			})
			.catch((err) => {
				setModelsError(err.message);
			})
			.finally(() => {
				setLoadingModels(false);
			});
	}, [state.provider, state.parsingModelApiKey]);

	useEffect(() => {
		if (!state.contextModelApiKey) {
			setFetchedContextModels([]);
			setContextModelsError("");
			return;
		}

		setLoadingContextModels(true);
		setContextModelsError("");

		fetch("/api/models", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				provider: state.contextProvider,
				apiKey: state.contextModelApiKey,
			}),
		})
			.then((res) => {
				if (!res.ok) {
					return res.json().then((errorData) => {
						throw new Error(errorData.error || `Failed to fetch models: ${res.statusText}`);
					});
				}
				return res.json();
			})
			.then((data) => {
				// API returns { data: [{ value: string, label: string }] }
				const models = (data.data || []).map((m: { value: string; label: string }) => ({
					value: m.value,
					label: m.label,
				})) as ModelOption[];
				setFetchedContextModels(models);
			})
			.catch((err) => {
				setContextModelsError(err.message);
			})
			.finally(() => {
				setLoadingContextModels(false);
			});
	}, [state.contextProvider, state.contextModelApiKey]);

	const currentModels = fetchedModels;
	const currentContextModels = fetchedContextModels;

	const isDirty = useMemo(
		() => JSON.stringify(state) !== JSON.stringify(baseline),
		[state, baseline],
	);

	const parsingModelPlaceholder = useMemo(() => {
		if (!state.parsingModelApiKey) {
			return "← Enter API key";
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

	const parsingModelOptions: ComboboxOption[] = useMemo(() => {
		return currentModels.map((m) => ({
			value: m.value,
			label: m.label,
		}));
	}, [currentModels]);

	const contextModelOptions: ComboboxOption[] = useMemo(() => {
		return currentContextModels.map((m) => ({
			value: m.value,
			label: m.label,
		}));
	}, [currentContextModels]);

	// Load existing API keys and settings from backend on mount
	useEffect(() => {
		async function loadSettings() {
			try {
				setLoadingKeys(true);
				const keys = await getModelApiKeys();

				// Filter to only active keys
				const activeKeys = keys.filter((k) => k.is_active);

				// Find keys with model_pattern (these are tied to specific models)
				// We'll use the first one for parsing, second for context (or same if only one)
				// If multiple keys exist for same provider, prefer ones with model_pattern
				const keysWithModels = activeKeys.filter((k) => k.model_pattern);
				const keysWithoutModels = activeKeys.filter((k) => !k.model_pattern);

				// For parsing model: prefer key with model_pattern, fallback to any active key
				const parsingKey =
					keysWithModels.find((k) => k.provider === "openai") ||
					keysWithModels[0] ||
					keysWithoutModels.find((k) => k.provider === "openai") ||
					keysWithoutModels[0];

				// For context model: prefer different key than parsing, or same if only one exists
				const contextKey =
					keysWithModels.find(
						(k) => k.id !== parsingKey?.id && k.provider === "openai",
					) ||
					keysWithModels.find((k) => k.id !== parsingKey?.id) ||
					keysWithModels[0] ||
					keysWithoutModels.find((k) => k.id !== parsingKey?.id) ||
					keysWithoutModels[0];

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
			!state.parsingModelApiKey.includes("...") &&
			state.parsingModelApiKey.length >= 20;
		if (hasParsingKey && !state.defaultParsingModel) {
			errors.push("Parsing Model: Please select a model for your API key");
		}

		// Check context model: if API key is provided (and not a preview), model must be selected
		const hasContextKey =
			state.contextModelApiKey &&
			!state.contextModelApiKey.includes("...") &&
			state.contextModelApiKey.length >= 20;
		if (hasContextKey && !state.contextModel) {
			errors.push("Context Model: Please select a model for your API key");
		}

		return errors;
	}, [state]);

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
		setSaveError(null);

		try {
			// Save parsing model API key if changed and model is selected
			if (
				state.parsingModelApiKey &&
				state.parsingModelApiKey !== baseline.parsingModelApiKey &&
				state.defaultParsingModel
			) {
				const isPreview =
					state.parsingModelApiKey.includes("...") ||
					state.parsingModelApiKey.length < 20;
				if (!isPreview) {
					await upsertModelApiKey(
						state.provider,
						state.parsingModelApiKey,
						state.defaultParsingModel,
					);
				}
			}

			// Save context model API key if changed and model is selected
			if (
				state.contextModelApiKey &&
				state.contextModelApiKey !== baseline.contextModelApiKey &&
				state.contextModel
			) {
				const isPreview =
					state.contextModelApiKey.includes("...") ||
					state.contextModelApiKey.length < 20;
				if (!isPreview) {
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
					(!k.model_pattern || k.model_pattern === state.defaultParsingModel),
			);
			const contextKey = keys.find(
				(k) =>
					k.provider === state.contextProvider &&
					k.is_active &&
					(!k.model_pattern || k.model_pattern === state.contextModel),
			);

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
			setSaveError(errorMessage);
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
															const shouldCopy =
																providerValue === s.contextProvider &&
																s.contextModelApiKey &&
																!s.contextModelApiKey.includes("...") &&
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
												isPreview={
													!!state.parsingModelApiKey &&
													state.parsingModelApiKey.includes("...")
												}
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
												<Combobox
													options={parsingModelOptions}
													value={state.defaultParsingModel}
													onValueChange={(value) => {
														const modelValue =
															typeof value === "string" ? value : value[0];
														setState((s) => ({
															...s,
															defaultParsingModel: modelValue,
														}));
													}}
													placeholder={parsingModelPlaceholder}
													emptyMessage="No models found."
													searchPlaceholder="Search models..."
													disabled={Boolean(
														!state.parsingModelApiKey ||
															!parsingKeyValid ||
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
															const shouldCopy =
																providerValue === s.provider &&
																s.parsingModelApiKey &&
																!s.parsingModelApiKey.includes("...") &&
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
												isPreview={
													!!state.contextModelApiKey &&
													state.contextModelApiKey.includes("...")
												}
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
												<Combobox
													options={contextModelOptions}
													value={state.contextModel}
													onValueChange={(value) => {
														const modelValue =
															typeof value === "string" ? value : value[0];
														setState((s) => ({
															...s,
															contextModel: modelValue,
														}));
													}}
													placeholder={contextModelPlaceholder}
													emptyMessage="No models found."
													searchPlaceholder="Search models..."
													disabled={Boolean(
														!state.contextModelApiKey ||
															!contextKeyValid ||
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
				<div className="mt-10 flex flex-col items-end gap-2">
					{saveError && (
						<div className="text-sm text-destructive">{saveError}</div>
					)}
					<Button
						disabled={!isDirty || saving || loadingKeys}
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
