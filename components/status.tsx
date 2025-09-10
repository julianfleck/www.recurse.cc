"use client";

import { IconApi } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Status as KiboStatus } from "@/components/ui/kibo-ui/status";

interface HealthStatus {
	status: "healthy" | "unhealthy" | "degraded";
	timestamp: string;
	overall_health: string;
}

type StatusState = "online" | "offline" | "maintenance" | "degraded";

export function Status() {
	const [health, setHealth] = useState<HealthStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const fetchHealth = async () => {
		try {
			const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
			if (!baseUrl) {
				console.warn("NEXT_PUBLIC_BASE_URL not set, skipping health check");
				setError(true);
				return;
			}

			const response = await fetch(`${baseUrl}/health`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data: HealthStatus = await response.json();
			setHealth(data);
			setLastUpdated(new Date());
			setError(false);
		} catch (err) {
			console.error("Health check failed:", err);
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchHealth();

		// Poll every 30 seconds
		const interval = setInterval(fetchHealth, 30000);

		return () => clearInterval(interval);
	}, []);

	// Map health status to Kibo status
	const getKiboStatus = (): StatusState => {
		if (loading) return "maintenance";
		if (error || !health) return "offline";

		switch (health.status) {
			case "healthy":
				return "online";
			case "degraded":
				return "degraded";
			case "unhealthy":
				return "offline";
			default:
				return "offline";
		}
	};

	const status = getKiboStatus();

	return (
		<KiboStatus
			status={status}
			icon={IconApi}
			title={`Last checked: ${lastUpdated?.toLocaleTimeString()}`}
		/>
	);
}
