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
  
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Production: domain-based routing
    if (hostname.includes("docs.recurse.cc")) {
      return origin.replace("docs.recurse.cc", "dashboard.recurse.cc");
    }
    
    if (hostname.includes("www.recurse.cc")) {
      return origin.replace("www.recurse.cc", "dashboard.recurse.cc");
    }
    
    // Development: port-based routing
    // docs runs on 3000, dashboard on 3001, www on 3002
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      if (port === "3000" || !port) {
        // If on docs (port 3000) or default, dashboard is on 3001
        return `http://${hostname}:3001`;
      }
      if (port === "3002") {
        // If on www (port 3002), dashboard is on 3001
        return `http://${hostname}:3001`;
      }
      // If already on dashboard port or other, return same
      return origin;
    }
    
    // Other dev environments - assume same origin
    return origin;
  }
  
  // Server-side fallback
  return process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001";
}
