'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDocsUrl } from '@/lib/utils';
import { useMemo } from 'react';

interface DocsLinkButtonProps {
  variant?: 'default' | 'subtle' | 'outline' | 'ghost';
  showArrow?: boolean;
  children: React.ReactNode;
}

export function DocsLinkButton({
  variant = 'subtle',
  showArrow = false,
  children,
}: DocsLinkButtonProps) {
  const docsUrl = getDocsUrl();
  
  // Determine if this is a cross-origin link
  const { fullUrl, isCrossOrigin } = useMemo(() => {
    if (typeof window === 'undefined') {
      // Server-side: always use full URL and assume cross-origin
      return {
        fullUrl: `${docsUrl}/docs/introduction`,
        isCrossOrigin: true,
      };
    }

    const currentOrigin = window.location.origin;
    try {
      const docsOrigin = new URL(docsUrl).origin;
      const crossOrigin = docsOrigin !== currentOrigin;
      
      if (crossOrigin) {
        // Cross-origin: use full URL
        return {
          fullUrl: `${docsUrl}/docs/introduction`,
          isCrossOrigin: true,
        };
      } else {
        // Same origin: use relative path for Next.js routing
        return {
          fullUrl: '/docs/introduction',
          isCrossOrigin: false,
        };
      }
    } catch {
      // URL parsing failed, assume cross-origin
      return {
        fullUrl: `${docsUrl}/docs/introduction`,
        isCrossOrigin: true,
      };
    }
  }, [docsUrl]);

  // For cross-origin links, use anchor tag (full page navigation)
  // For same-origin links, use Next.js Link (client-side navigation)
  const content = (
    <>
      {children}
      {showArrow && (
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );

  if (isCrossOrigin) {
    return (
      <Button
        className="group rounded-full px-4 py-3 font-medium text-base"
        size="default"
        variant={variant}
        asChild
      >
        <a href={fullUrl}>
          {content}
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      className="group rounded-full px-4 py-3 font-medium text-base"
      size="default"
      variant={variant}
    >
      <Link href={fullUrl}>
        {content}
      </Link>
    </Button>
  );
}

