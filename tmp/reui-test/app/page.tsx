"use client";

import { useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui-local/command";
import { FileText, Home, Settings } from "lucide-react";

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">ReUI Clean Test</h1>
        
        <p className="text-muted-foreground">
          This is a fresh installation with Next.js 16, React 19, and Tailwind CSS v4.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Open Command Dialog
          </button>
        </div>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </CommandItem>
              <CommandItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Documentation</span>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* Decorative elements for backdrop blur testing */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
}
