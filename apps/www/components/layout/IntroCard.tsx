"use client";

import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import { FlushCard } from "./FlushCard";
import { IntroCardContent } from "./IntroCardContent";
import type { LucideIcon } from "lucide-react";

interface IntroCardProps {
	title: string;
	text?: string;
	icon?: LucideIcon;
	children?: ReactNode;
	className?: string;
	"data-col-span"?: string;
	"data-md-col-span"?: string;
	"data-lg-col-span"?: string;
	"data-row-span"?: string;
}

/**
 * IntroCard - Component for large intro cards (2x2)
 * Wraps IntroCardContent in a FlushCard with proper grid attributes
 */
export function IntroCard({
	title,
	text,
	icon,
	children,
	className,
	"data-col-span": dataColSpan,
	"data-md-col-span": dataMdColSpan,
	"data-lg-col-span": dataLgColSpan,
	"data-row-span": dataRowSpan,
}: IntroCardProps) {
	return (
		<div
			className={cn(
				"magic-bento-card magic-bento-card--border-glow",
				className,
			)}
			style={{ '--glow-color': '132, 0, 255' } as React.CSSProperties}
			data-col-span={dataColSpan}
			data-md-col-span={dataMdColSpan}
			data-lg-col-span={dataLgColSpan}
			data-row-span={dataRowSpan}
		>
			<FlushCard className="h-full">
				<IntroCardContent title={title} text={text} icon={icon}>
					{children}
				</IntroCardContent>
			</FlushCard>
		</div>
	);
}

