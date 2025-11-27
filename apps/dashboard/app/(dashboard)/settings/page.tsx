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
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/components/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SettingsPage() {
	// Seed defaults (could be loaded from API/local storage later)
	const authUser = useAuthStore((s) => s.user);

	const initialState = useMemo(
		() => ({
			defaultParsingModel:
				PARSING_MODELS.find((m) => m.value === "gpt-4o")?.value ||
				PARSING_MODELS[0]?.value ||
				"",
			parsingModelApiKey: "",
			contextModel: PARSING_MODELS[0]?.value ?? "",
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
		if (state.provider !== "openrouter" || !state.parsingModelApiKey) {
			setFetchedModels([]);
			setModelsError("");
			return;
		}

		setLoadingModels(true);
		setModelsError("");

		fetch("https://openrouter.ai/api/v1/models", {
			headers: {
				Authorization: `Bearer ${state.parsingModelApiKey}`,
			},
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Failed to fetch models: ${res.statusText}`);
				}
				return res.json();
			})
			.then((data) => {
				const models = data.data.map((m: { id: string; name: string }) => ({
					value: m.id,
					label: m.name,
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
		if (state.contextProvider !== "openrouter" || !state.contextModelApiKey) {
			setFetchedContextModels([]);
			setContextModelsError("");
			return;
		}

		setLoadingContextModels(true);
		setContextModelsError("");

		fetch("https://openrouter.ai/api/v1/models", {
			headers: {
				Authorization: `Bearer ${state.contextModelApiKey}`,
			},
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`Failed to fetch models: ${res.statusText}`);
				}
				return res.json();
			})
			.then((data) => {
				const models = data.data.map((m: { id: string; name: string }) => ({
					value: m.id,
					label: m.name,
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

	const currentModels =
		state.provider === "openai" ? PARSING_MODELS : fetchedModels;
	const currentContextModels =
		state.contextProvider === "openai" ? PARSING_MODELS : fetchedContextModels;

	const isDirty = useMemo(
		() => JSON.stringify(state) !== JSON.stringify(baseline),
		[state, baseline],
	);

	const parsingModelPlaceholder = useMemo(() => {
		if (state.provider === "openrouter") {
			if (!state.parsingModelApiKey) {
				return "Enter API key to load models";
			}
			if (loadingModels) {
				return "Loading models...";
			}
			if (modelsError) {
				return "Error loading models";
			}
		}
		return "Select model...";
	}, [
		state.provider,
		state.parsingModelApiKey,
		loadingModels,
		modelsError,
	]);

	const contextModelPlaceholder = useMemo(() => {
		if (state.contextProvider === "openrouter") {
			if (!state.contextModelApiKey) {
				return "Enter API key to load models";
			}
			if (loadingContextModels) {
				return "Loading models...";
			}
			if (contextModelsError) {
				return "Error loading models";
			}
		}
		return "Select model...";
	}, [
		state.contextProvider,
		state.contextModelApiKey,
		loadingContextModels,
		contextModelsError,
	]);

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

	const handleSave = () => {
		// For now, we just update the baseline. Integration with backend will come later.
		setBaseline(state);
	};

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
									<div className="flex flex-col items-stretch gap-2 sm:flex-row">
										<div className="flex items-center gap-2 sm:flex-1">
											<Combobox
												options={providers}
												value={state.provider}
												onValueChange={(value) => {
													const providerValue =
														typeof value === "string" ? value : value[0];
													setState((s) => ({
														...s,
														provider: providerValue,
														defaultParsingModel: "",
													}));
												}}
												placeholder="Select provider..."
												emptyMessage="No providers found."
												searchPlaceholder="Search providers..."
												className="flex-1"
											/>
										</div>
										<div className="flex items-center gap-2 sm:flex-1">
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
													state.provider === "openrouter" &&
														(!state.parsingModelApiKey ||
															loadingModels ||
															modelsError),
												)}
												className="flex-1"
											/>
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
											<Combobox
												options={providers}
												value={state.contextProvider}
												onValueChange={(value) => {
													const providerValue =
														typeof value === "string" ? value : value[0];
													setState((s) => ({
														...s,
														contextProvider: providerValue,
														contextModel: "",
													}));
												}}
												placeholder="Select provider..."
												emptyMessage="No providers found."
												searchPlaceholder="Search providers..."
												className="flex-1"
											/>
										</div>
										<div className="flex items-center gap-2 sm:flex-1">
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
													state.contextProvider === "openrouter" &&
														(!state.contextModelApiKey ||
															loadingContextModels ||
															contextModelsError),
												)}
												className="flex-1"
											/>
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
