'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DocsRedirectPage() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Get the docs base URL
    const docsBaseUrl = (() => {
      // Check env var first
      if (process.env.NEXT_PUBLIC_DOCS_URL) {
        return process.env.NEXT_PUBLIC_DOCS_URL;
      }
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // Production: domain-based routing
        if (hostname.includes('dashboard.recurse.cc')) {
          return 'https://docs.recurse.cc';
        }
        
        // Development: port-based routing
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return `http://${hostname}:3000`;
        }
        
        // Fallback for other environments
        return 'https://docs.recurse.cc';
      }
      
      // Server-side fallback
      return process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3000';
    })();

    // Preserve the path after /docs
    // e.g., /docs/introduction -> docs.recurse.cc/introduction
    // Remove the leading /docs from pathname
    const remainingPath = pathname.replace(/^\/docs/, '') || '/';
    
    // Construct the full URL
    const redirectUrl = `${docsBaseUrl}${remainingPath}${window.location.search}`;
    
    // Use full page navigation for cross-origin redirect
    window.location.href = redirectUrl;
  }, [pathname]);

  return null;
}

