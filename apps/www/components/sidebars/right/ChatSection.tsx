"use client";

import { Button } from "@recurse/ui/components";
import { Loader2, Send } from "lucide-react";
import * as React from "react";
import { useDemoApp } from "@/contexts/DemoAppContext";
import { useSession } from "@/contexts/SessionContext";
import { cn } from "@/lib/utils";

export function ChatSection() {
	const [message, setMessage] = React.useState("");
	const {
		messagesBySession,
		addMessage,
		isLoading,
		setIsLoading,
		mainDocumentBySession,
		setCurrentSessionId,
	} = useDemoApp();
	const { selectedSessionId, createSession } = useSession();
	const messages = messagesBySession[selectedSessionId || ""] || [];
	const messagesEndRef = React.useRef<HTMLDivElement>(null);
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	// Auto-scroll to bottom when messages change
	React.useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	// Auto-resize textarea based on content
	React.useEffect(() => {
		if (textareaRef.current) {
			// Reset height to auto to get the correct scrollHeight
			textareaRef.current.style.height = "auto";
			// Only expand if there's actual content
			if (message) {
				textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
			} else {
				// Keep at minimum height when empty
				textareaRef.current.style.height = "36px";
			}
		}
	}, [message]);

	// Set initial height on mount
	React.useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "36px";
		}
	}, []);

	const handleSend = async () => {
		if (message.trim()) {
			const userMessage = message.trim();

			// Create a new session if none exists
			let sessionId = selectedSessionId;
			if (!sessionId) {
				// Create a new session with the first message as preview
				sessionId = createSession(
					userMessage.slice(0, 30) + (userMessage.length > 30 ? "..." : ""),
					userMessage,
				);
				// Immediately update the current session ID in DemoAppContext
				setCurrentSessionId(sessionId);
			}

			setMessage("");

			// Add user message
			addMessage({ role: "user", content: userMessage }, sessionId);

			// Simulate AI response
			setIsLoading(true);

			// Use the sessionId we have, not the one from context which might not be updated yet
			const currentSessionId = sessionId;

			setTimeout(() => {
				// Get the main document title using the current session ID
				const currentMainDocumentId = mainDocumentBySession[currentSessionId];
				const currentMainDocumentTitle = currentMainDocumentId?.startsWith(
					"doc-",
				)
					? currentMainDocumentId.substring(4)
					: currentMainDocumentId;

				const responseBase = currentMainDocumentTitle
					? `Based on the information in "${currentMainDocumentTitle}" and other documents in your active context, `
					: "Based on the documents in your active context, ";

				addMessage(
					{
						role: "assistant",
						content:
							responseBase +
							"I can help answer your question. This is a demo response that would normally contain relevant information extracted from your documents.",
					},
					currentSessionId,
				);
				setIsLoading(false);
			}, 1000);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Messages area */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{messages.length === 0 ? (
					<div className="text-left text-muted-foreground">
						<p className="text-sm">
							Get answers about content in your knowledge base by chatting with
							the recurse agent.
						</p>
					</div>
				) : (
					messages.map((msg, index) => (
						<div
							className={cn(
								"flex",
								msg.role === "user" ? "justify-end" : "justify-start",
							)}
							key={index}
						>
							<div
								className={cn(
									"max-w-[85%] rounded-lg px-3 py-2 text-sm",
									msg.role === "user"
										? "bg-primary text-primary-foreground"
										: "bg-muted",
								)}
							>
								<p className="whitespace-pre-wrap">{msg.content}</p>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Loading indicator */}
			{isLoading && (
				<div className="px-4 pb-2">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Loader2 className="h-3 w-3 animate-spin" />
						<span>AI is thinking...</span>
					</div>
				</div>
			)}

			{/* Input area */}
			<div className="border-t p-4">
				<div className="relative flex items-center">
					<textarea
						className="max-h-[120px] min-h-[36px] flex-1 resize-none overflow-hidden rounded-md border border-input bg-transparent px-3 py-[7px] pr-11 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						data-chat-input
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Ask a question..."
						ref={textareaRef}
						rows={1}
						value={message}
					/>
					<Button
						className="absolute right-1.5 h-7 w-7"
						disabled={!message.trim()}
						onClick={handleSend}
						size="icon"
						variant="subtle"
					>
						<Send className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
