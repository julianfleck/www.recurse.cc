'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getDashboardUrl } from '@/lib/utils';

export default function DashboardRedirectPage() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Get the dashboard base URL
    const dashboardBaseUrl = getDashboardUrl();
    
    // Preserve the path after /dashboard
    // e.g., /dashboard/settings -> dashboard.recurse.cc/settings
    // Remove the leading /dashboard from pathname
    const remainingPath = pathname.replace(/^\/dashboard/, '') || '/';
    
    // Construct the full URL
    const redirectUrl = `${dashboardBaseUrl}${remainingPath}${window.location.search}`;
    
    // Use full page navigation for cross-origin redirect
    window.location.href = redirectUrl;
  }, [pathname]);

  return null;
}

