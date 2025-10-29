'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDocsUrl } from '@/lib/utils';

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

  return (
    <Button
      asChild
      className="group rounded-full px-4 py-3 font-medium text-base"
      size="default"
      variant={variant}
    >
      <Link href={`${docsUrl}/docs/introduction`}>
        {children}
        {showArrow && (
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        )}
      </Link>
    </Button>
  );
}

