"use client";

import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import { FlushCard } from "./FlushCard";

interface HeaderCardProps {
	title: string;
	children?: ReactNode;
	className?: string;
	"data-col-span"?: string;
	"data-md-col-span"?: string;
	"data-lg-col-span"?: string;
	"data-row-span"?: string;
}

/**
 * HeaderCard - Component for section headers using intro-style typography
 * Uses large headline typography matching the intro section style
 */
export function HeaderCard({
	title,
	children,
	className,
	"data-col-span": dataColSpan,
	"data-md-col-span": dataMdColSpan,
	"data-lg-col-span": dataLgColSpan,
	"data-row-span": dataRowSpan,
}: HeaderCardProps) {
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
				<div className="flex h-full items-center justify-center py-8 text-center md:py-12 lg:py-16">
					<h2 className="font-medium text-3xl leading-tight tracking-tight md:text-5xl lg:text-6xl">
						{title}
					</h2>
					{children}
				</div>
			</FlushCard>
		</div>
	);
}

