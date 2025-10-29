export function isOnAuthPage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return ["/login", "/signup", "/forgot-password"].includes(
    window.location.pathname
  );
}

/**
 * Get the dashboard URL dynamically, works in both dev and prod.
 * Falls back to inferring from current origin if env var not set.
 */
export function getDashboardUrl(): string {
  // Check for explicit env var first
  if (process.env.NEXT_PUBLIC_DASHBOARD_URL) {
    return process.env.NEXT_PUBLIC_DASHBOARD_URL;
  }
  
  // In dev, dashboard typically runs on a different port
  // Assume same origin but might need port adjustment
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    
    // If on docs.recurse.cc, dashboard is dashboard.recurse.cc
    if (origin.includes("docs.recurse.cc")) {
      return origin.replace("docs.recurse.cc", "dashboard.recurse.cc");
    }
    
    // If on www.recurse.cc, dashboard is dashboard.recurse.cc
    if (origin.includes("www.recurse.cc")) {
      return origin.replace("www.recurse.cc", "dashboard.recurse.cc");
    }
    
    // In dev, assume dashboard is on same origin (or configure ports)
    // Default to same origin - can be overridden with env var
    return origin;
  }
  
  // Server-side fallback
  return process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";
}
