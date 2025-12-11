"use client";

import { ApiError } from "./api";
import Link from "next/link";

/**
 * Structure of API error messages from the backend
 */
export type ApiErrorMessage = {
	error: string;
	resource?: string;
	current?: number;
	limit?: number;
	[key: string]: unknown;
};

/**
 * Action that can be taken to resolve an error
 */
export type UploadErrorAction = {
	label: string;
	href: string;
	variant?: "default" | "outline" | "link";
};

/**
 * User-friendly error definition
 */
export type UploadErrorDefinition = {
	title: string;
	description: string | ((details: ApiErrorMessage) => string);
	actions?: UploadErrorAction[];
};

/**
 * React component for rendering upload error toast content
 */
export function UploadErrorToast({ error }: { error: unknown }) {
	const { errorCode, message } = parseApiError(error);
	const definition = getUploadError(error);
	const description = formatErrorDescription(definition, message);

	return (
		<div className="flex flex-col gap-1">
			<span className="font-medium">{definition.title}</span>
			<span className="text-muted-foreground text-xs">{description}</span>
			{definition.actions && definition.actions.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{definition.actions.map((action, index) => (
						<Link
							key={index}
							href={action.href}
							className="text-primary hover:underline text-xs font-medium"
						>
							{action.label} →
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Error code to error definition mapping
 */
const ERROR_DEFINITIONS: Record<string, UploadErrorDefinition> = {
	quota_exceeded: {
		title: "Upload limit reached",
		description: (details) => {
			const resource = details.resource;
			const current = details.current;
			const limit = details.limit;

			if (resource === "daily_add_requests") {
				return `You've reached your daily upload limit of ${limit} document${limit !== 1 ? "s" : ""}. Your limit will reset tomorrow.`;
			}

			if (resource === "max_documents") {
				return `You've reached your maximum document limit of ${limit} document${limit !== 1 ? "s" : ""}. Please delete some documents or upgrade your plan to upload more.`;
			}

			if (resource === "max_storage_mb") {
				const storageGB = limit ? (limit / 1024).toFixed(1) : "unknown";
				return `You've reached your storage limit of ${storageGB} GB. Please delete some documents or upgrade your plan to upload more.`;
			}

			// Generic quota message
			if (current !== undefined && limit !== undefined) {
				return `You've reached your limit of ${limit}. Currently using ${current} of ${limit}.`;
			}

			return "You've reached your upload limit. Please try again later or upgrade your plan.";
		},
		actions: [
			{
				label: "View Settings",
				href: "/dashboard/settings",
				variant: "outline",
			},
		],
	},
	file_too_large: {
		title: "File too large",
		description: "The file you're trying to upload exceeds the maximum allowed size. Please try a smaller file.",
		actions: [
			{
				label: "View Limits",
				href: "/dashboard/settings",
				variant: "outline",
			},
		],
	},
	invalid_file_type: {
		title: "Invalid file type",
		description: "This file type is not supported. Please upload a supported file format.",
	},
	storage_exceeded: {
		title: "Storage limit exceeded",
		description: (details) => {
			const limit = details.limit;
			const storageGB = limit ? (limit / 1024).toFixed(1) : "unknown";
			return `You've exceeded your storage limit of ${storageGB} GB. Please delete some documents or upgrade your plan.`;
		},
		actions: [
			{
				label: "Manage Documents",
				href: "/dashboard/documents",
				variant: "outline",
			},
			{
				label: "View Settings",
				href: "/dashboard/settings",
				variant: "outline",
			},
		],
	},
	authentication_required: {
		title: "Authentication required",
		description: "Please log in to upload files.",
		actions: [
			{
				label: "Log in",
				href: "/login",
				variant: "default",
			},
		],
	},
	rate_limit_exceeded: {
		title: "Rate limit exceeded",
		description: "You're uploading files too quickly. Please wait a moment and try again.",
	},
};

/**
 * Parses an API error and extracts the error message structure
 */
export function parseApiError(error: unknown): {
	errorCode: string | null;
	message: ApiErrorMessage | null;
} {
	if (!(error instanceof ApiError)) {
		return { errorCode: null, message: null };
	}

	// Check if details contains a message object
	const details = error.details;
	if (!details || typeof details !== "object") {
		return { errorCode: null, message: null };
	}

	// Handle nested message structure: { error: "...", message: { error: "...", ... } }
	const messageData = "message" in details && typeof details.message === "object" && details.message !== null
		? details.message as ApiErrorMessage
		: details as ApiErrorMessage;

	if (!messageData || typeof messageData.error !== "string") {
		return { errorCode: null, message: null };
	}

	return {
		errorCode: messageData.error,
		message: messageData,
	};
}

/**
 * Gets a user-friendly error definition for an upload error
 */
export function getUploadError(error: unknown): UploadErrorDefinition {
	const { errorCode, message } = parseApiError(error);

	if (!errorCode || !message) {
		// Fallback for unknown errors
		return {
			title: "Upload failed",
			description: error instanceof Error ? error.message : "An unexpected error occurred while uploading the file.",
		};
	}

	const definition = ERROR_DEFINITIONS[errorCode];

	if (!definition) {
		// Unknown error code, but we have the structure
		return {
			title: "Upload failed",
			description: `An error occurred: ${errorCode}`,
		};
	}

	return definition;
}

/**
 * Formats the description from an error definition
 */
export function formatErrorDescription(
	definition: UploadErrorDefinition,
	message: ApiErrorMessage | null,
): string {
	if (typeof definition.description === "function") {
		return message ? definition.description(message) : definition.description({ error: "unknown" });
	}
	return definition.description;
}

/**
 * Renders error actions as React components
 */
export function renderErrorActions(actions?: UploadErrorAction[]) {
	if (!actions || actions.length === 0) {
		return null;
	}

	return (
		<div className="mt-3 flex flex-wrap gap-2">
			{actions.map((action, index) => (
				<Link
					key={index}
					href={action.href}
					className="text-primary hover:underline text-sm font-medium"
				>
					{action.label}
				</Link>
			))}
		</div>
	);
}

/**
 * Creates a toast-compatible error message component
 */
export function createUploadErrorToast(error: unknown): {
	title: string;
	description: string;
	actions?: UploadErrorAction[];
} {
	const { errorCode, message } = parseApiError(error);
	const definition = getUploadError(error);
	const description = formatErrorDescription(definition, message);

	return {
		title: definition.title,
		description,
		actions: definition.actions,
	};
}

