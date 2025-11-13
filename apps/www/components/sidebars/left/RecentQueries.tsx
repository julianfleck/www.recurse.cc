import { useUIStore } from "@recurse/ui/lib";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useViewer } from "@/contexts/ViewerContext";
import { cn } from "@/lib/utils";

export interface QuerySession {
	id: string;
	title: string;
	timestamp: Date;
	preview?: string;
	messageCount?: number;
	mainDocumentId?: string;
}

interface RecentQueriesProps {
	sessions: QuerySession[];
	selectedSessionId?: string;
	onSessionSelect?: (sessionId: string) => void;
	onCreateNewChat?: () => void;
	onDeleteSession?: (sessionId: string) => void;
}

function SessionItem({
	session,
	isSelected,
	viewMode,
	onSessionClick,
	onDeleteSession,
}: {
	session: QuerySession;
	isSelected: boolean;
	viewMode: "chat" | "viewer";
	onSessionClick: (session: QuerySession) => void;
	onDeleteSession?: (sessionId: string) => void;
}) {
	const [dropdownOpen, setDropdownOpen] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = React.useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setDropdownOpen(true);
	}, []);

	const handleMouseLeave = React.useCallback(() => {
		timeoutRef.current = setTimeout(() => {
			setDropdownOpen(false);
		}, 300); // 300ms delay before closing
	}, []);

	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<div
			className={cn(
				"group flex items-center gap-0 rounded-md transition-all",
				"hover:bg-sidebar-accent/50",
				isSelected && viewMode === "chat" ? "bg-sidebar-accent/50" : "",
			)}
		>
			<button
				className="flex-1 px-2 py-1.5 text-left"
				onClick={() => onSessionClick(session)}
			>
				<span
					className={cn(
						"block truncate text-sm",
						isSelected && viewMode === "chat"
							? "font-medium text-sidebar-foreground"
							: "text-sidebar-foreground/80",
					)}
				>
					{session.title}
				</span>
			</button>
			<DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
				<DropdownMenuTrigger
					asChild
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<button
						className="mr-1 rounded-md p-1 opacity-0 transition-opacity hover:bg-sidebar-accent group-hover:opacity-100"
						onClick={(e) => e.stopPropagation()}
						type="button"
					>
						<MoreVertical className="h-3 w-3" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="z-[110] w-56"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<DropdownMenuItem
						className="text-destructive text-xs focus:text-destructive"
						onClick={() => onDeleteSession?.(session.id)}
					>
						<Trash2 className="mr-2 h-3.5 w-3.5" />
						Delete Chat
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export function RecentQueries({
	sessions,
	selectedSessionId,
	onSessionSelect,
	onCreateNewChat,
	onDeleteSession,
}: RecentQueriesProps) {
	const [showAll, setShowAll] = React.useState(false);
	const visibleSessions = showAll ? sessions : sessions.slice(0, 3);
	const { viewMode, setViewMode, selectItem } = useViewer();
	const { setChatOpen } = useUIStore();

	const handleSessionClick = (session: QuerySession) => {
		setViewMode("chat");
		onSessionSelect?.(session.id);

		// Ensure chat pane is open
		setChatOpen(true);

		// If the session has a main document, load it in the viewer
		if (session.mainDocumentId) {
			// Extract the title from the document ID (e.g., "doc-Research Paper.pdf" -> "Research Paper.pdf")
			const docTitle = session.mainDocumentId.startsWith("doc-")
				? session.mainDocumentId.substring(4)
				: session.mainDocumentId;

			selectItem({
				id: session.mainDocumentId,
				title: docTitle,
				type: "document",
			});
		}
	};

	// Show empty state with create button when no sessions
	if (sessions.length === 0) {
		return (
			<div className="space-y-1">
				<button
					className={cn(
						"w-full rounded-md px-2 py-1.5 text-left transition-all",
						"hover:bg-sidebar-accent/50",
						"text-sidebar-foreground/70 text-sm hover:text-sidebar-foreground",
						"flex items-center gap-2",
					)}
					onClick={onCreateNewChat}
				>
					<Plus className="h-3.5 w-3.5" />
					<span>Create new chat</span>
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{visibleSessions.map((session) => (
				<SessionItem
					isSelected={selectedSessionId === session.id}
					key={session.id}
					onDeleteSession={onDeleteSession}
					onSessionClick={handleSessionClick}
					session={session}
					viewMode={viewMode}
				/>
			))}
			{sessions.length > 3 && (
				<button
					className="mt-2 w-full rounded-md px-2 py-1 text-left text-sidebar-foreground/70 text-xs transition-colors hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
					onClick={() => setShowAll(!showAll)}
				>
					{showAll ? "Show less" : "Load older sessions..."}
				</button>
			)}
		</div>
	);
}
