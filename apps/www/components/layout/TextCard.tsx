"use client";

import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import { FlushCard } from "./FlushCard";

interface TextCardProps {
	texts: string[];
	children?: ReactNode;
	className?: string;
	textClassName?: string;
	"data-col-span"?: string;
	"data-md-col-span"?: string;
	"data-lg-col-span"?: string;
	"data-row-span"?: string;
}

/**
 * TextCard - Component for cards with multiple text blocks
 * Texts are distributed with justify-between (top to bottom)
 */
export function TextCard({
	texts,
	children,
	className,
	textClassName,
	"data-col-span": dataColSpan,
	"data-md-col-span": dataMdColSpan,
	"data-lg-col-span": dataLgColSpan,
	"data-row-span": dataRowSpan,
}: TextCardProps) {
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
				<div className="flex h-full flex-col justify-between">
					{texts.map((text, index) => (
						<div key={index} className={cn("text-left", textClassName)}>
							<p className="font-light text-base text-muted-foreground leading-relaxed md:text-lg lg:text-xl">
								{text}
							</p>
						</div>
					))}
					{children && <div className="text-left">{children}</div>}
				</div>
			</FlushCard>
		</div>
	);
}

