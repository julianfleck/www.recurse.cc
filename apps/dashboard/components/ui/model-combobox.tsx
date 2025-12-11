"use client";

import * as React from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@recurse/ui/components/command";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@recurse/ui/components/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@recurse/ui/components/tabs";
import { Sparkles, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AvailableModel } from "@/lib/models/types";

type ModelComboboxProps = {
	models: AvailableModel[];
	value?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	emptyMessage?: string;
	searchPlaceholder?: string;
	disabled?: boolean;
	className?: string;
	modelType?: "parsing" | "context";
};

function formatPrice(value?: string): string {
	if (!value || value === "0") return "0";
	// Convert scientific notation to decimal
	const num = Number.parseFloat(value);
	if (Number.isNaN(num)) return value;
	return num.toFixed(8);
}

/**
 * Parse markdown links in text and return JSX with actual links
 */
function parseMarkdownLinks(text: string): React.ReactNode {
	// Match markdown links: [text](url)
	const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	const parts: React.ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = markdownLinkRegex.exec(text)) !== null) {
		// Add text before the link
		if (match.index > lastIndex) {
			parts.push(text.slice(lastIndex, match.index));
		}

		// Add the link
		const linkText = match[1];
		let url = match[2];

		// Prefix relative URLs with https://openrouter.ai
		if (!url.startsWith("http://") && !url.startsWith("https://")) {
			url = `https://openrouter.ai${url.startsWith("/") ? "" : "/"}${url}`;
		}

		parts.push(
			<a
				key={match.index}
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary underline hover:text-primary/80"
				onClick={(e) => e.stopPropagation()}
			>
				{linkText}
			</a>,
		);

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}

	return parts.length > 0 ? parts : text;
}

function ModelCard({ model, isEmpty }: { model: AvailableModel | null; isEmpty?: boolean }) {
	if (!model || isEmpty) {
		return (
			<div className="flex h-full min-h-[400px] flex-col justify-center gap-2 rounded-md border bg-muted/40 p-4 text-muted-foreground">
				<p className="font-medium text-base">No models found</p>
				<p className="text-sm">Try adjusting your search or switch to the "All" tab.</p>
			</div>
		);
	}

	const pricing = model.pricing ?? {};
	const promptPrice = formatPrice(pricing.prompt);
	const completionPrice = formatPrice(pricing.completion);

	return (
		<div className="flex h-full w-full flex-col rounded-md border bg-muted/40 p-4">
			<div className="mb-1 flex min-h-8 items-start justify-between gap-3">
				<div className="min-w-0 flex-1 overflow-hidden">
					<div className="truncate text-base font-semibold">
						{model.name}
					</div>
					<div className="truncate text-xs text-muted-foreground">
						{model.id}
					</div>
				</div>
				<div className="w-12 shrink-0">
					{model.is_free ? (
						<span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
							free
						</span>
					) : null}
				</div>
			</div>

			{model.description ? (
				<ScrollArea className="mb-4 mt-3 flex-1 min-h-0 relative">
					<div className="pr-4 pb-6">
						<p className="text-sm leading-relaxed text-muted-foreground">
							{parseMarkdownLinks(model.description)}
						</p>
					</div>
					<div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-muted/40 via-muted/20 to-transparent pointer-events-none" />
				</ScrollArea>
			) : (
				<div className="mb-4 mt-3" />
			)}

			<div className="mt-auto space-y-3 text-sm">
				<div className="flex items-center justify-between border-b border-dashed pb-3">
					<span className="shrink-0 text-muted-foreground">Price $</span>
					<div className="flex min-w-0 flex-col items-end gap-0.5 font-mono text-xs">
						<span className="whitespace-nowrap">{promptPrice} input</span>
						<span className="whitespace-nowrap">{completionPrice} output</span>
					</div>
				</div>

				<div className="flex items-center justify-between border-b border-dashed pb-3">
					<span className="shrink-0 text-muted-foreground">Context length</span>
					<span className="whitespace-nowrap font-mono text-xs">
						{model.context_length
							? `${model.context_length.toLocaleString()} tokens`
							: "—"}
					</span>
				</div>
			</div>
		</div>
	);
}

export function ModelCombobox({
	models,
	value,
	onValueChange,
	placeholder = "Select a model…",
	emptyMessage = "No models found.",
	searchPlaceholder = "Search models…",
	disabled,
	className,
	modelType = "parsing",
}: ModelComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [hoveredId, setHoveredId] = React.useState<string | null>(null);
	const [activeTab, setActiveTab] = React.useState<
		"recommended" | "free" | "all"
	>("recommended");
	const commandListRef = React.useRef<HTMLDivElement>(null);
	const dialogContentRef = React.useRef<HTMLDivElement>(null);

	// Only show models that support structured output and aren't deprecated
	const baseModels = React.useMemo(
		() =>
			models.filter(
				(m) =>
					m.supports_structured_output &&
					!m.description?.toLowerCase().includes("deprecated"),
			),
		[models],
	);

	// Filter models based on tab selection
	const availableModels = React.useMemo(() => {
		if (activeTab === "all") {
			return baseModels;
		}

		if (activeTab === "free") {
			return baseModels.filter((m) => m.is_free);
		}

		// Recommended: filter by keywords in description
		if (modelType === "parsing") {
			// For parsing models, look for structured output, JSON, schema, or parsing-related terms
			const keywords = [
				"json",
				"schema",
				"parsing",
				"extract",
				"deepseek",
				"kimi",
				"minimax",
				"doubao",
				"yi",
			];
			return baseModels.filter((m) => {
				const desc = m.description?.toLowerCase() || "";
				const name = m.name?.toLowerCase() || "";
				const searchText = `${desc} ${name}`;
				
				// Exclude "structured output" from general search unless it's a specific capability
				// but check for other keywords
				return keywords.some((keyword) => searchText.includes(keyword));
			});
		} else {
			// For context models, look for reasoning-related terms
			const keywords = ["reasoning", "think", "reason", "logic", "rational"];
			return baseModels.filter((m) => {
				const desc = m.description?.toLowerCase() || "";
				const name = m.name?.toLowerCase() || "";
				const searchText = `${desc} ${name}`;
				return keywords.some((keyword) => searchText.includes(keyword));
			});
		}
	}, [baseModels, activeTab, modelType]);

	// Create a lookup map for filter function
	const modelLookup = React.useMemo(() => {
		const map = new Map<string, AvailableModel>();
		availableModels.forEach((model) => {
			map.set(model.name.toLowerCase(), model);
		});
		return map;
	}, [availableModels]);

	const selectedModel = React.useMemo(
		() => availableModels.find((m) => m.id === value),
		[availableModels, value],
	);

	const activeModel = React.useMemo(() => {
		return (
			availableModels.find((m) => m.id === hoveredId) ||
			selectedModel ||
			availableModels[0] ||
			null
		);
	}, [hoveredId, availableModels, selectedModel]);

	const displayText = selectedModel ? selectedModel.name : placeholder;

	// Focus input when dialog opens
	React.useEffect(() => {
		if (open) {
			// Small delay to ensure DOM is ready and animation has started
			setTimeout(() => {
				const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
				if (input) {
					input.focus();
				}
			}, 50);
		}
	}, [open]);

	// Scroll to selected item when dialog opens
	React.useEffect(() => {
		if (!open || !value || !selectedModel) return;

		// Use requestAnimationFrame for better timing with dialog animations
		const scrollToSelected = () => {
			// Try multiple containers
			const containers = [
				dialogContentRef.current,
				commandListRef.current,
				document.querySelector('[data-slot="dialog-content"]'),
			].filter(Boolean) as HTMLElement[];

			for (const container of containers) {
				// Strategy 1: Find by data attribute
				let selectedElement = container.querySelector(
					`[data-model-id="${value}"]`,
				) as HTMLElement;

				// Strategy 2: Find by cmdk-item with matching text content
				if (!selectedElement && selectedModel.name) {
					const items = container.querySelectorAll('[cmdk-item]');
					for (const item of Array.from(items)) {
						const itemElement = item as HTMLElement;
						const text = itemElement.textContent?.trim() || '';
						if (text.includes(selectedModel.name)) {
							selectedElement = itemElement;
							break;
						}
					}
				}

				// Strategy 3: Find by IconCircleCheckFilled icon (selected state)
				if (!selectedElement) {
					// Look for the check icon - Tabler icons use specific class names
					const checkIcon = container.querySelector(
						'svg[class*="IconCircleCheckFilled"], svg[class*="icon-circle-check-filled"], [data-selected="true"]',
					);
					if (checkIcon) {
						selectedElement = checkIcon.closest('[cmdk-item]') as HTMLElement;
					}
				}

				if (selectedElement) {
					selectedElement.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
					return; // Success, stop trying other containers
				}
			}
		};

		// Wait for dialog to fully open and DOM to be ready
		requestAnimationFrame(() => {
			setTimeout(scrollToSelected, 100);
		});
	}, [open, value, selectedModel]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"min-w-0 flex-1 justify-between overflow-hidden",
						className,
					)}
				>
					<span className="mr-2 flex-1 min-w-0 truncate text-left">
						{displayText}
					</span>
					<ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DialogTrigger>
			<DialogContent
				ref={dialogContentRef}
				className="max-w-[min(800px,calc(100vw-2rem))] p-0 max-h-[80vh] flex flex-col"
				variant="default"
			>
				<DialogTitle className="px-6 pt-6 pb-4 text-lg font-semibold">
					{modelType === "parsing"
						? "Select Parsing Model"
						: "Select Context Model"}
				</DialogTitle>
				<div className="flex flex-col min-h-[500px] h-full overflow-hidden">
					<div className="px-6 pt-4 border-t shrink-0">
						<Tabs
							value={activeTab}
							onValueChange={(v) =>
								setActiveTab(v as "recommended" | "free" | "all")
							}
						>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="recommended">
									<Sparkles className="size-4" />
									Recommended
								</TabsTrigger>
								<TabsTrigger value="free">
									<IconCircleCheckFilled className="size-4 text-emerald-500" />
									Free
								</TabsTrigger>
								<TabsTrigger value="all">
									<List className="size-4" />
									All
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
					<div className="flex flex-col gap-2 p-6 sm:flex-row flex-1 min-h-0">
						<div className="mb-2 w-full sm:mb-0 sm:w-[320px] sm:shrink-0">
							<ModelCard model={activeModel} isEmpty={availableModels.length === 0} />
						</div>
						<div className="min-w-0 flex-1 flex flex-col rounded-md border overflow-hidden min-h-0">
							<Command
								value={selectedModel?.name || ""}
								className="flex flex-col h-full min-h-0 overflow-hidden"
								filter={(value, search) => {
									// Custom filter that searches both name and description
									const model = modelLookup.get(value.toLowerCase());
									if (!model) return 0;

									if (!search) return 1; // Show all if no search

									const searchLower = search.toLowerCase();
									const nameMatch = model.name
										.toLowerCase()
										.includes(searchLower);
									const descMatch = model.description
										?.toLowerCase()
										.includes(searchLower);
									const idMatch = model.id.toLowerCase().includes(searchLower);

									if (nameMatch || descMatch || idMatch) {
										// Prioritize name matches
										return nameMatch ? 2 : 1;
									}
									return 0;
								}}
							>
								<CommandInput placeholder={searchPlaceholder} />
								<CommandList ref={commandListRef} className="flex-1 min-h-0 overflow-y-auto max-h-none">
									<CommandEmpty>{emptyMessage}</CommandEmpty>
									<CommandGroup>
										{availableModels.map((model) => {
											const isSelected = model.id === value;
											return (
												<CommandItem
													key={model.id}
													value={model.name}
													data-model-id={model.id}
													onSelect={() => {
														onValueChange?.(model.id);
														setOpen(false);
													}}
													onMouseEnter={() => setHoveredId(model.id)}
												>
													{isSelected ? (
														<IconCircleCheckFilled className="mr-2 h-4 w-4 shrink-0 text-primary" />
													) : (
														<IconCircle className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
													)}
													<span className="truncate">{model.name}</span>
												</CommandItem>
											);
										})}
									</CommandGroup>
								</CommandList>
							</Command>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}


