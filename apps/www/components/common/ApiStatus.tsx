"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/services/api";

type ApiStatus = "checking" | "normal" | "error";

export function ApiStatus() {
	const [status, setStatus] = useState<ApiStatus>("checking");

	useEffect(() => {
		const checkApiHealth = async () => {
			try {
				const apiService = new ApiService("https://api.recurse.cc");
				// Try to fetch the health endpoint
				await apiService.fetch("/health");
				setStatus("normal");
			} catch {
				setStatus("error");
			}
		};

		// Check immediately
		checkApiHealth();

		// Check every 30 seconds
		const interval = setInterval(checkApiHealth, 30_000);

		return () => clearInterval(interval);
	}, []);

	const getStatusColor = () => {
		switch (status) {
			case "normal":
				return "bg-green-500";
			case "error":
				return "bg-orange-500";
			default:
				return "bg-yellow-500";
		}
	};

	const getStatusText = () => {
		switch (status) {
			case "normal":
				return "All systems normal";
			case "error":
				return "API unavailable";
			default:
				return "Checking status...";
		}
	};

	return (
		<div className="flex items-center gap-2 text-muted-foreground text-sm px-1.5 py-1 rounded-sm bg-muted/20 border border-muted/80">
			<div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
			<span>{getStatusText()}</span>
		</div>
	);
}
