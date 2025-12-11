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
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
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
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-[min(640px,calc(100vw-3rem))] p-0"
			>
				<div className="flex flex-col gap-2 p-2 sm:flex-row">
					<div className="mb-2 w-full sm:mb-0 sm:w-[320px] sm:shrink-0">
						<ModelCard model={activeModel} />
					</div>
					<div className="min-w-0 flex-1">
						<Command>
							<CommandInput placeholder={searchPlaceholder} />
							<CommandList>
								<CommandEmpty>{emptyMessage}</CommandEmpty>
								<CommandGroup>
									{availableModels.map((model) => {
										const isSelected = model.id === value;
										return (
											<CommandItem
												key={model.id}
												value={model.name}
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
			</PopoverContent>
		</Popover>
	);
}


