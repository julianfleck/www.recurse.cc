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
const AUTH_SUBSCRIBE_DELAY_MS = 100;
const INITIAL_CHECK_DELAY_MS = 50;
const HEALTH_RETRY_BASE_DELAY_MS = 2500;
const DOCUMENT_RETRY_BASE_DELAY_MS = 3000;

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

// Shared retry scheduling helper with simple linear backoff
function scheduleRetry(opts: {
  retryCount: number;
  maxRetries: number;
  retryRef: React.MutableRefObject<NodeJS.Timeout | null>;
  baseDelayMs: number;
  onRetry: () => void;
}): boolean {
  const { retryCount, maxRetries, retryRef, baseDelayMs, onRetry } = opts;
  if (retryCount >= maxRetries || retryRef.current) {
    return false;
  }
  const delay = baseDelayMs * (retryCount + 1);
  retryRef.current = setTimeout(() => {
    retryRef.current = null;
    onRetry();
  }, delay);
  return true;
}

function redirectToLoginIfAuthError(err: unknown): boolean {
  if (err instanceof Error && err.name === "AuthenticationError") {
    if (!isOnAuthPage()) {
      window.location.href = "/login";
    }
    return true;
  }
  return false;
}

function isAuthHttpError(message: string): boolean {
  return message.includes("401") || message.includes("403");
}

export function HealthStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Prevent multiple simultaneous retries
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const fetchHealth = useCallback(async (retryCount = 0) => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    try {
      const response = await apiService.get<HealthStatus>("/health", undefined, { requireAuth: false });

      setHealth(response.data);
      setLastUpdated(new Date());
      setError(false);
    } catch (err) {
      // If it's an authentication error and we haven't retried yet, wait a bit and retry
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (
        err instanceof Error &&
        (errorMessage.includes("401") || errorMessage.includes("403")) &&
        scheduleRetry({
          retryCount,
          maxRetries: 2,
          retryRef: retryTimeoutRef,
          baseDelayMs: HEALTH_RETRY_BASE_DELAY_MS,
          onRetry: () => fetchHealth(retryCount + 1),
        })
      ) {
        return;
      }

      setError(true);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const fetchIfAuthenticated = () => {
      if (!isMounted) {
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (token) {
        fetchHealth();
      }
    };

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.accessToken) {
        // Add a small delay to ensure auth is stable
        timeoutId = setTimeout(
          fetchIfAuthenticated,
          AUTH_SUBSCRIBE_DELAY_MS
        );
      }
    });

    // Check immediately with a small delay to ensure component is ready
    timeoutId = setTimeout(fetchIfAuthenticated, INITIAL_CHECK_DELAY_MS);

    // Set up interval for polling
    intervalId = setInterval(() => {
      fetchHealth();
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

  // Prevent multiple simultaneous retries
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const fetchDocumentCount = useCallback(async (retryCount = 0) => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
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
      if (redirectToLoginIfAuthError(err)) {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to load document count";

      // If it's an authentication error and we haven't retried yet, wait a bit and retry
      if (
        err instanceof Error &&
        isAuthHttpError(errorMessage) &&
        scheduleRetry({
          retryCount,
          maxRetries: 2,
          retryRef: retryTimeoutRef,
          baseDelayMs: DOCUMENT_RETRY_BASE_DELAY_MS,
          onRetry: () => fetchDocumentCount(retryCount + 1),
        })
      ) {
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const fetchIfAuthenticated = () => {
      if (!isMounted) {
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (token) {
        fetchDocumentCount();
      }
    };

    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.accessToken) {
        // Add a small delay to ensure auth is stable
        timeoutId = setTimeout(
          fetchIfAuthenticated,
          AUTH_SUBSCRIBE_DELAY_MS
        );
      }
    });

    // Check immediately with a small delay to ensure component is ready
    timeoutId = setTimeout(fetchIfAuthenticated, INITIAL_CHECK_DELAY_MS);

    // Set up interval for refreshing
    intervalId = setInterval(() => {
      fetchDocumentCount();
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
