'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  // Simply use /docs path - the redirect page will handle forwarding to the correct app
  const content = (
    <>
      {children}
      {showArrow && (
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );

  return (
    <Button
      asChild
      className="group rounded-full px-4 py-3 font-medium text-base"
      size="default"
      variant={variant}
    >
      <Link href="/docs/introduction">
        {content}
      </Link>
    </Button>
  );
}

