import * as React from "react";
import type { QuerySession } from "@/components/sidebars/left/RecentQueries";

interface SessionContextType {
	sessions: QuerySession[];
	selectedSessionId: string | null;
	selectSession: (sessionId: string) => void;
	createSession: (title: string, preview?: string) => string;
	updateSession: (sessionId: string, updates: Partial<QuerySession>) => void;
	deleteSession: (sessionId: string) => void;
}

const SessionContext = React.createContext<SessionContextType | undefined>(
	undefined,
);

// Start with empty sessions to show empty state
const initialSessions: QuerySession[] = [];

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const [sessions, setSessions] =
		React.useState<QuerySession[]>(initialSessions);
	const [selectedSessionId, setSelectedSessionId] = React.useState<
		string | null
	>(null);

	const selectSession = React.useCallback((sessionId: string) => {
		setSelectedSessionId(sessionId);
	}, []);

	const createSession = React.useCallback((title: string, preview?: string) => {
		const newSession: QuerySession = {
			id: `session-${Date.now()}`,
			title,
			timestamp: new Date(),
			preview,
			messageCount: 0,
		};
		setSessions((prev) => [newSession, ...prev]);
		setSelectedSessionId(newSession.id);
		return newSession.id;
	}, []);

	const updateSession = React.useCallback(
		(sessionId: string, updates: Partial<QuerySession>) => {
			setSessions((prev) =>
				prev.map((session) =>
					session.id === sessionId ? { ...session, ...updates } : session,
				),
			);
		},
		[],
	);

	const deleteSession = React.useCallback(
		(sessionId: string) => {
			setSessions((prev) => prev.filter((session) => session.id !== sessionId));
			// If the deleted session was selected, clear the selection
			if (selectedSessionId === sessionId) {
				setSelectedSessionId(null);
			}
		},
		[selectedSessionId],
	);

	return (
		<SessionContext.Provider
			value={{
				sessions,
				selectedSessionId,
				selectSession,
				createSession,
				updateSession,
				deleteSession,
			}}
		>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const context = React.useContext(SessionContext);
	if (context === undefined) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
}
