import { type ReactNode } from "react";
import { FileIcon, SearchIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type BaseStateCardProps = {
	title: string;
	description?: string;
	icon?: ReactNode;
	className?: string;
	children?: ReactNode;
};

function BaseStateCard({
	title,
	description,
	icon,
	className,
	children,
}: BaseStateCardProps) {
	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-xl flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 px-8 py-10 text-center shadow-sm",
				className,
			)}
		>
			{icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
			<h2 className="font-semibold text-lg">{title}</h2>
			{description ? (
				<p className="mt-2 max-w-md text-muted-foreground text-sm">
					{description}
				</p>
			) : null}
			{children ? <div className="mt-4 w-full">{children}</div> : null}
		</div>
	);
}

type LoadingStateCardProps = {
	title?: string;
	description?: string;
	className?: string;
};

export function LoadingStateCard({
	title = "Loading…",
	description,
	className,
}: LoadingStateCardProps) {
	return (
		<BaseStateCard
			className={className}
			description={description}
			icon={<Spinner size={32} />}
			title={title}
		/>
	);
}

type EmptyStateCardProps = {
	title: string;
	description?: string;
	variant?: "documents" | "search" | "default";
	className?: string;
	children?: ReactNode;
};

export function EmptyStateCard({
	title,
	description,
	variant = "default",
	className,
	children,
}: EmptyStateCardProps) {
	const icon =
		variant === "documents" ? (
			<FileIcon className="h-8 w-8" />
		) : variant === "search" ? (
			<SearchIcon className="h-8 w-8" />
		) : null;

	return (
		<BaseStateCard
			className={className}
			description={description}
			icon={icon}
			title={title}
		>
			{children}
		</BaseStateCard>
	);
}


