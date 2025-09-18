"use client";

import { IconActivity } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { Status as KiboStatus } from "@/components/ui/kibo-ui/status";
import { apiService } from "@/lib/api";

type HealthStatus = {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  overall_health: string;
};

type StatusState = "online" | "offline" | "maintenance" | "degraded";

// Constants
const HEALTH_CHECK_INTERVAL_MS = 30_000;
const DOCUMENT_COUNT_REFRESH_MINUTES = 5;
const MILLISECONDS_PER_MINUTE = 60_000;
const DOCUMENT_COUNT_REFRESH_INTERVAL_MS =
  DOCUMENT_COUNT_REFRESH_MINUTES * MILLISECONDS_PER_MINUTE;

// Auth initialization delay constants
const AUTH_INIT_DELAY_MS = 1000; // 1 second for health status
const DOCUMENT_AUTH_INIT_DELAY_MS = 1500; // 1.5 seconds for document count

// Response type for document search API
type DocumentSearchResponse = {
  nodes: unknown[];
  total_found: number;
  search_time_ms: number;
  filters_applied: string[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
};

export function HealthStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await apiService.get<HealthStatus>("/health");

      setHealth(response.data);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Add a small delay to allow auth service to initialize
    const initialDelay = setTimeout(() => {
      fetchHealth();
    }, AUTH_INIT_DELAY_MS);

    // Poll every 30 seconds
    const interval = setInterval(fetchHealth, HEALTH_CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [fetchHealth]);

  // Map health status to Kibo status
  const getKiboStatus = (): StatusState => {
    if (loading) {
      return "maintenance";
    }
    if (error || !health) {
      return "offline";
    }

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
      className="mt-2"
    //   icon={IconActivity}
      showTooltip={true}
      status={status}
      title={`API Status at ${lastUpdated?.toLocaleTimeString()}`}
    />
  );
}

export function DocumentCountStatus() {
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentCount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.get<DocumentSearchResponse>(
        "/search/document",
        {
          field_set: "basic",
          depth: 0,
          limit: 100,
          page: 1,
          min_score: 0,
        }
      );

      setDocumentCount(response.data.pagination.total_count);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load document count";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Add a small delay to allow auth service to initialize
    const initialDelay = setTimeout(() => {
      fetchDocumentCount();
    }, DOCUMENT_AUTH_INIT_DELAY_MS);

    // Refresh every 5 minutes
    const interval = setInterval(
      fetchDocumentCount,
      DOCUMENT_COUNT_REFRESH_INTERVAL_MS
    );

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [fetchDocumentCount]);

  let displayText: string;
  if (isLoading) {
    displayText = "Loading...";
  } else if (error) {
    displayText = "Error";
  } else {
    displayText = `${documentCount?.toLocaleString() ?? 0} documents`;
  }

  const tooltipTitle = error
    ? `Error loading document count: ${error}`
    : `Total documents in collection: ${documentCount?.toLocaleString() ?? 0}`;

  return (
    <KiboStatus
      className="mt-2"
      showTooltip={true}
      status={error ? "offline" : "online"}
      title={tooltipTitle}
    >
      {documentCount?.toLocaleString() ?? displayText}
    </KiboStatus>
  );
}
