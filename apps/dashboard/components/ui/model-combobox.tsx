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
	DialogTrigger,
} from "@recurse/ui/components/dialog";
import { Button } from "@/components/ui/button";
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

function ModelCard({ model }: { model: AvailableModel | null }) {
	if (!model) {
		return (
			<div className="flex h-full flex-col justify-center gap-2 rounded-md border bg-muted/40 p-4 text-muted-foreground">
				<p className="font-medium text-base">Model details</p>
				<p className="text-sm">Hover a model on the right to see its details.</p>
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
				<p className="mb-4 mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
					{parseMarkdownLinks(model.description)}
				</p>
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
}: ModelComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [hoveredId, setHoveredId] = React.useState<string | null>(null);
	const commandListRef = React.useRef<HTMLDivElement>(null);
	const dialogContentRef = React.useRef<HTMLDivElement>(null);

	// Only show models that support structured output and aren't deprecated
	const availableModels = React.useMemo(
		() =>
			models.filter(
				(m) =>
					m.supports_structured_output &&
					!m.description?.toLowerCase().includes("deprecated"),
			),
		[models],
	);

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
				className="max-w-[min(800px,calc(100vw-2rem))] p-0"
				variant="default"
			>
				<div className="flex flex-col gap-2 p-4 sm:flex-row sm:p-6">
					<div className="mb-2 w-full sm:mb-0 sm:w-[320px] sm:shrink-0">
						<ModelCard model={activeModel} />
					</div>
					<div className="min-w-0 flex-1 rounded-md border">
						<Command value={selectedModel?.name || ""}>
							<CommandInput placeholder={searchPlaceholder} />
							<CommandList ref={commandListRef}>
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
			</DialogContent>
		</Dialog>
	);
}


