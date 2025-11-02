"use client";

import { useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@recurse/ui/components/command";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@recurse/ui/components/dialog";
import { Button } from "@recurse/ui/components";
import { TestTube, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDialogButtonProps {
	className?: string;
}

export function TestDialogButton({ className }: TestDialogButtonProps) {
	const [commandOpen, setCommandOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<>
			{/* Command Dialog Test */}
			<Button
				className={cn("h-10 w-10 p-0", className)}
				size="icon"
				variant="outline"
				tooltip="Test Command Dialog"
				tooltipSide="bottom"
				onClick={() => setCommandOpen(true)}
			>
				<TestTube className="h-4 w-4" />
			</Button>
			<CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Test Items">
						<CommandItem>Test Item 1</CommandItem>
						<CommandItem>Test Item 2</CommandItem>
						<CommandItem>Test Item 3</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>

			{/* Plain Dialog Test */}
			<Button
				className={cn("h-10 w-10 p-0", className)}
				size="icon"
				variant="outline"
				tooltip="Test Plain Dialog"
				tooltipSide="bottom"
				onClick={() => setDialogOpen(true)}
			>
				<FlaskConical className="h-4 w-4" />
			</Button>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Test Plain Dialog</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p>
							This is a simple dialog to test backdrop blur without the command component.
						</p>
						<p className="text-sm text-muted-foreground">
							Check if backdrop blur works: <code className="bg-muted px-1 rounded">[backdrop-filter:blur(4px)]</code>
						</p>
						<p className="text-sm text-muted-foreground">
							The close button should be in the top-right corner.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

