'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getDocsUrl } from '@/lib/utils';

export default function DocsRedirectPage() {
  const pathname = usePathname();

  useEffect(() => {
    // Get the docs base URL
    const docsBaseUrl = getDocsUrl();

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
