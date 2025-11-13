"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

export interface UploadedFile {
	id: string;
	name: string;
	size: number;
	status: "uploading" | "processing" | "completed" | "error";
	progress: number;
	uploadedAt: Date;
	frames?: ExtractedFrame[];
}

export interface ExtractedFrame {
	id: string;
	title: string;
	content: string;
	type: "claim" | "concept" | "entity" | "relationship" | "fact";
	sourceFileId: string;
	confidence: number;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

interface DemoAppContextType {
	// Current step
	currentStep: "upload" | "chat";
	setCurrentStep: (step: "upload" | "chat") => void;

	// Files
	files: UploadedFile[];
	addFile: (file: UploadedFile) => void;
	addFiles: (files: File[]) => void;
	updateFileStatus: (
		id: string,
		status: UploadedFile["status"],
		progress?: number,
	) => void;
	selectedFileIds: string[];
	selectedFiles: string[];
	toggleFileSelection: (id: string) => void;

	// Extracted frames
	frames: ExtractedFrame[];
	addFrames: (frames: ExtractedFrame[]) => void;

	// Chat - now per session
	messagesBySession: Record<string, ChatMessage[]>;
	messages: ChatMessage[]; // Current session messages
	addMessage: (
		message: Omit<ChatMessage, "id" | "timestamp">,
		sessionId?: string,
	) => void;
	deleteSessionMessages: (sessionId: string) => void;
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
	setCurrentSessionId: (sessionId: string) => void;
	currentSessionId: string | null;
	mainDocumentBySession: Record<string, string>; // Maps session ID to main document ID
	setMainDocumentForSession: (sessionId: string, documentId: string) => void;
}

const DemoAppContext = createContext<DemoAppContextType | undefined>(undefined);

export function DemoAppProvider({ children }: { children: ReactNode }) {
	const [currentStep, setCurrentStep] = useState<"upload" | "chat">("chat");
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
	const [frames, setFrames] = useState<ExtractedFrame[]>([]);

	// Initialize with empty messages to show empty state
	const [messagesBySession, setMessagesBySession] = useState<
		Record<string, ChatMessage[]>
	>({});

	const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Initialize empty main documents
	const [mainDocumentBySession, setMainDocumentBySession] = useState<
		Record<string, string>
	>({});

	// Get messages for current session
	const messages = currentSessionId
		? messagesBySession[currentSessionId] || []
		: [];

	const addFile = (file: UploadedFile) => {
		setFiles((prev) => [...prev, file]);
	};

	const addFiles = (files: File[]) => {
		files.forEach((file) => {
			const uploadedFile: UploadedFile = {
				id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
				name: file.name,
				size: file.size,
				status: "uploading",
				progress: 0,
				uploadedAt: new Date(),
			};

			addFile(uploadedFile);

			// Simulate upload progress
			let progress = 0;
			const uploadInterval = setInterval(() => {
				progress += Math.random() * 30;
				if (progress >= 100) {
					progress = 100;
					updateFileStatus(uploadedFile.id, "processing", progress);
					clearInterval(uploadInterval);

					// Simulate processing
					setTimeout(() => {
						updateFileStatus(uploadedFile.id, "completed", 100);

						// Generate sample frames for this file
						const sampleFrames: ExtractedFrame[] = [
							{
								id: `frame-${uploadedFile.id}-1`,
								title: `Key concept from ${file.name}`,
								content:
									"This is a sample extracted concept from the uploaded file.",
								type: "concept",
								sourceFileId: uploadedFile.id,
								confidence: 0.85 + Math.random() * 0.1,
							},
							{
								id: `frame-${uploadedFile.id}-2`,
								title: `Important fact from ${file.name}`,
								content:
									"This represents a fact or assertion found in the document.",
								type: "fact",
								sourceFileId: uploadedFile.id,
								confidence: 0.75 + Math.random() * 0.15,
							},
						];

						// Add frames to the file
						setFiles((prev) =>
							prev.map((f) =>
								f.id === uploadedFile.id ? { ...f, frames: sampleFrames } : f,
							),
						);

						addFrames(sampleFrames);
					}, 2000);
				} else {
					updateFileStatus(uploadedFile.id, "uploading", progress);
				}
			}, 200);
		});
	};

	const updateFileStatus = (
		id: string,
		status: UploadedFile["status"],
		progress?: number,
	) => {
		setFiles((prev) =>
			prev.map((file) =>
				file.id === id
					? { ...file, status, progress: progress ?? file.progress }
					: file,
			),
		);
	};

	const toggleFileSelection = (id: string) => {
		setSelectedFileIds((prev) =>
			prev.includes(id)
				? prev.filter((fileId) => fileId !== id)
				: [...prev, id],
		);
	};

	const addFrames = (newFrames: ExtractedFrame[]) => {
		setFrames((prev) => [...prev, ...newFrames]);
	};

	const addMessage = (
		message: Omit<ChatMessage, "id" | "timestamp">,
		sessionId?: string,
	) => {
		const targetSessionId = sessionId || currentSessionId;
		if (!targetSessionId) {
			return;
		}

		const newMessage: ChatMessage = {
			...message,
			id: Date.now().toString(),
			timestamp: new Date(),
		};

		setMessagesBySession((prev) => ({
			...prev,
			[targetSessionId]: [...(prev[targetSessionId] || []), newMessage],
		}));
	};

	const setMainDocumentForSession = (sessionId: string, documentId: string) => {
		setMainDocumentBySession((prev) => ({
			...prev,
			[sessionId]: documentId,
		}));
	};

	const deleteSessionMessages = (sessionId: string) => {
		setMessagesBySession((prev) => {
			const newMessages = { ...prev };
			delete newMessages[sessionId];
			return newMessages;
		});

		// Also delete the main document reference
		setMainDocumentBySession((prev) => {
			const newDocs = { ...prev };
			delete newDocs[sessionId];
			return newDocs;
		});
	};

	return (
		<DemoAppContext.Provider
			value={{
				currentStep,
				setCurrentStep,
				files,
				addFile,
				addFiles,
				updateFileStatus,
				selectedFileIds,
				selectedFiles: selectedFileIds,
				toggleFileSelection,
				frames,
				addFrames,
				messagesBySession,
				messages,
				addMessage,
				deleteSessionMessages,
				isLoading,
				setIsLoading,
				setCurrentSessionId,
				currentSessionId,
				mainDocumentBySession,
				setMainDocumentForSession,
			}}
		>
			{children}
		</DemoAppContext.Provider>
	);
}

export function useDemoApp() {
	const context = useContext(DemoAppContext);
	if (context === undefined) {
		throw new Error("useDemoApp must be used within a DemoAppProvider");
	}
	return context;
}
