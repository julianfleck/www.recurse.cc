"use client";

import type {
	AccordionMultipleProps,
	AccordionSingleProps,
} from "@radix-ui/react-accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, ChevronRight, Link as LinkIcon } from "lucide-react";
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { buttonVariants } from "./ui/button";

export const Accordions = forwardRef<
	HTMLDivElement,
	| Omit<AccordionSingleProps, "value" | "onValueChange">
	| Omit<AccordionMultipleProps, "value" | "onValueChange">
>(({ type = "single", className, defaultValue, ...props }, ref) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const composedRef = mergeRefs(ref, rootRef);
	const [value, setValue] = useState<string | string[]>(() =>
		type === "single" ? (defaultValue ?? "") : (defaultValue ?? []),
	);

	useEffect(() => {
		const id = window.location.hash.substring(1);
		const element = rootRef.current;
		if (!element || id.length === 0) {
			return;
		}

		const selected = document.getElementById(id);
		if (!(selected && element.contains(selected))) {
			return;
		}
		const value = selected.getAttribute("data-accordion-value");

		if (value) {
			setValue((prev) => (typeof prev === "string" ? value : [value, ...prev]));
		}
	}, []);

	return (
		// @ts-expect-error -- Multiple types
		<AccordionPrimitive.Root
			className={cn(
				"divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card",
				className,
			)}
			collapsible={type === "single" ? true : undefined}
			onValueChange={setValue}
			ref={composedRef}
			type={type}
			value={value}
			{...props}
		/>
	);
});

Accordions.displayName = "Accordions";

export const Accordion = forwardRef<
	HTMLDivElement,
	Omit<
		ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
		"value" | "title"
	> & {
		title: string | ReactNode;
		value?: string;
	}
>(
	(
		{ title, className, id, value = String(title), children, ...props },
		ref,
	) => {
		return (
			<AccordionPrimitive.Item
				className={cn("scroll-m-24", className)}
				ref={ref}
				value={value}
				{...props}
			>
				<AccordionPrimitive.Header
					className="not-prose flex flex-row items-center font-medium text-fd-card-foreground has-focus-visible:bg-fd-accent"
					data-accordion-value={value}
					id={id}
				>
					<AccordionPrimitive.Trigger className="group flex flex-1 items-center gap-2 px-3 py-2.5 text-start focus-visible:outline-none">
						<ChevronRight className="size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
						{title}
					</AccordionPrimitive.Trigger>
					{id ? <CopyButton id={id} /> : null}
				</AccordionPrimitive.Header>
				<AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down">
					<div className="prose-no-margin px-4 pb-2 text-[15px]">
						{children}
					</div>
				</AccordionPrimitive.Content>
			</AccordionPrimitive.Item>
		);
	},
);

function CopyButton({ id }: { id: string }) {
	const [checked, onClick] = useCopyButton(() => {
		const url = new URL(window.location.href);
		url.hash = id;

		return navigator.clipboard.writeText(url.toString());
	});

	return (
		<button
			aria-label="Copy Link"
			className={cn(
				buttonVariants({
					variant: "ghost",
					className: "me-2 text-fd-muted-foreground",
				}),
			)}
			onClick={onClick}
			type="button"
		>
			{checked ? (
				<Check className="size-3.5" />
			) : (
				<LinkIcon className="size-3.5" />
			)}
		</button>
	);
}

Accordion.displayName = "Accordion";
