"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/components/auth/auth-store";
import { Status as KiboStatus } from "@/components/ui/kibo-ui/status";
import { apiService } from "@/lib/api";
import { isOnAuthPage } from "@/lib/auth-utils";

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
const _AUTH_INIT_DELAY_MS = 1000; // 1 second for health status
const _DOCUMENT_AUTH_INIT_DELAY_MS = 1500; // 1.5 seconds for document count

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

  // Prevent multiple simultaneous retries
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHealth = useCallback(async (retryCount = 0) => {
    try {
      const response = await apiService.get<HealthStatus>("/health");

      setHealth(response.data);
      setLastUpdated(new Date());
      setError(false);
    } catch (err) {
      // If it's an authentication error and we haven't retried yet, wait a bit and retry
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (
        err instanceof Error &&
        (errorMessage.includes("401") || errorMessage.includes("403")) &&
        retryCount < 2 &&
        !retryTimeoutRef.current
      ) {
        const delay = 2500 * (retryCount + 1); // 2.5s, 5s delays

        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          fetchHealth(retryCount + 1);
        }, delay);
        return;
      }

      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const fetchIfAuthenticated = () => {
      if (!isMounted) {
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (token && !loading) {
        fetchHealth();
      }
    };

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.accessToken) {
        // Add a small delay to ensure auth is stable
        timeoutId = setTimeout(fetchIfAuthenticated, 100);
      }
    });

    // Check immediately with a small delay to ensure component is ready
    timeoutId = setTimeout(fetchIfAuthenticated, 50);

    // Set up interval for polling
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchHealth();
      }
    }, HEALTH_CHECK_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      unsubscribe();
    };
  }, [fetchHealth, loading]);

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

  // Prevent multiple simultaneous retries
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocumentCount = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get<DocumentSearchResponse>(
        "/search/document",
        {
          field_set: "basic",
          depth: 0,
          min_score: 0,
          limit: 1,
          page: 1,
        }
      );
      setDocumentCount(response.data.pagination.total_count);
    } catch (err) {
      // Handle authentication errors by redirecting to login (but not when already on auth pages)
      if (err instanceof Error && err.name === "AuthenticationError") {
        if (!isOnAuthPage()) {
          window.location.href = "/login";
        }
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to load document count";

      // If it's an authentication error and we haven't retried yet, wait a bit and retry
      if (
        err instanceof Error &&
        (errorMessage.includes("401") || errorMessage.includes("403")) &&
        retryCount < 2 &&
        !retryTimeoutRef.current
      ) {
        const delay = 3000 * (retryCount + 1); // 3s, 6s delays

        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          fetchDocumentCount(retryCount + 1);
        }, delay);
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const fetchIfAuthenticated = () => {
      if (!isMounted) {
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (token && !isLoading) {
        fetchDocumentCount();
      }
    };

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.accessToken) {
        // Add a small delay to ensure auth is stable
        timeoutId = setTimeout(fetchIfAuthenticated, 100);
      }
    });

    // Check immediately with a small delay to ensure component is ready
    timeoutId = setTimeout(fetchIfAuthenticated, 50);

    // Set up interval for refreshing
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchDocumentCount();
      }
    }, DOCUMENT_COUNT_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      unsubscribe();
    };
  }, [fetchDocumentCount, isLoading]);

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
