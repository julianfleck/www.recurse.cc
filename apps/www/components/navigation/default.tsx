'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { SearchToggle } from '@/components/search/toggle';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';
import { TooltipProvider } from '@/components/ui/tooltip';
// Import content files
import navContent from '@/content/en/navigation.json' with { type: 'json' };
import { useDemo } from '@/contexts/DemoContext';
import { useScroll } from '@/contexts/ScrollContext';
import { cn, getDocsUrl } from '@/lib/utils';

// Assert types (basic for now)
const contentNav = navContent as {
  home: string;
  features: string;
  details: string;
  faq: string;
  technology: string;
  demo: string;
  beta: string;
  featureDropdown: FeatureComponent[];
};

// Use featureDropdown data from JSON
const featureComponents = contentNav.featureDropdown as FeatureComponent[];

// Define the type for feature components based on usage
interface FeatureComponent {
  title: string;
  href: string;
  description: string;
}

// Define props type including isCompact and isHovered
interface DefaultNavigationProps {
  isCompact: boolean;
  isHovered: boolean;
}

// Reusable ListItem component
const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          ref={ref}
          {...props}
        >
          <div className="font-medium text-sm leading-none">{title}</div>
          <p className="line-clamp-4 pt-2 text-muted-foreground text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

// Accept isCompact and isHovered props
export function DefaultNavigation({
  isCompact,
  isHovered,
}: DefaultNavigationProps) {
  const pathname = usePathname();
  const { scrollToElement } = useScroll();
  const { openDemo } = useDemo();

  // Base transition classes for menu items
  const menuItemTransition = 'transition-all duration-300 ease-in-out';
  const hoverDelayBase = 100; // Base delay for staggered animation

  const handleBetaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') {
      // On home page, scroll to beta section
      scrollToElement('beta');
    } else {
      // On other pages, navigate to home page with beta anchor
      window.location.href = '/#beta';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'mx-auto size-full max-w-4xl'
      )}
    >
      {/* Left side: Wordmark and main navigation */}
      <div className="flex items-center space-x-8 py-4">
        {/* Wordmark - Conditionally adjust font size */}
        <Link
          className={cn(
            'whitespace-nowrap transition-all duration-300',
            'font-bold',
            isCompact ? 'text-[1rem]' : 'text-[1.8rem]'
          )}
          href="/"
        >
          <span className="">recurse</span>
          <span className="font-normal">.cc</span>
        </Link>

        {/* Navigation Menu - Conditionally visible based on compact state OR hover state when not compact */}
        <NavigationMenu
          className={cn(
            menuItemTransition,
            // Always visible and translated correctly when compact
            isCompact
              ? 'translate-x-0 opacity-100'
              : // When not compact, animate based on hover
                isHovered
                ? 'translate-x-0 opacity-100'
                : '-translate-x-4 pointer-events-none opacity-0'
          )}
        >
          <NavigationMenuList>
            {/* Home Item - Conditionally Rendered */}
            {pathname !== '/' && (
              <NavigationMenuItem
                className={cn(
                  menuItemTransition,
                  // Always visible when compact (with delay), otherwise depends on hover (with delay)
                  isCompact
                    ? `opacity-100 delay-${hoverDelayBase}`
                    : isHovered
                      ? `opacity-100 delay-${hoverDelayBase}`
                      : 'opacity-0'
                )}
              >
                <NavigationMenuLink asChild>
                  <Link
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'transition-none',
                      isCompact ? 'h-9 px-2 text-sm' : ''
                    )}
                    href="/"
                  >
                    {contentNav.home}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
            {/* About Item - scrolls to section */}
            <NavigationMenuItem
              className={cn(
                menuItemTransition,
                // Stagger delay (adjust index if Home is hidden)
                isCompact
                  ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 3 : 2)}`
                  : isHovered
                    ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 3 : 2)}`
                    : 'opacity-0'
              )}
            >
              <NavigationMenuLink asChild>
                <Link
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'transition-none',
                    isCompact ? 'h-9 px-2 text-sm' : ''
                  )}
                  href="/about"
                >
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {/* Features Dropdown */}
            <NavigationMenuItem
              className={cn(
                menuItemTransition,
                // Stagger delay (adjust index if Home is hidden)
                isCompact
                  ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 2 : 1)}`
                  : isHovered
                    ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 2 : 1)}`
                    : 'opacity-0'
              )}
            >
              <NavigationMenuTrigger
                className={cn(
                  'transition-none',
                  isCompact ? 'h-9 px-2 text-sm' : ''
                )}
              >
                {contentNav.features}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {featureComponents.map((component: FeatureComponent) => (
                    <ListItem
                      href={component.href}
                      key={component.title}
                      title={component.title}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Technology Dropdown */}
            <NavigationMenuItem
              className={cn(
                menuItemTransition,
                // Stagger delay (adjust index if Home is hidden)
                isCompact
                  ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 4 : 3)}`
                  : isHovered
                    ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 4 : 3)}`
                    : 'opacity-0'
              )}
            >
              <NavigationMenuTrigger
                className={cn(
                  'transition-none',
                  isCompact ? 'h-9 px-2 text-sm' : ''
                )}
              >
                {contentNav.technology}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem
                    href="/about#frame-semantics"
                    title="Frame Semantics"
                  >
                    Structured knowledge representation using semantic frames
                    with defined roles and relationships for precise context
                    understanding.
                  </ListItem>
                  <ListItem
                    href="/about#recursive-graphs"
                    title="Recursive Graph Construction"
                  >
                    Dynamic graph building that learns and evolves through
                    interaction patterns, creating self-improving knowledge
                    structures.
                  </ListItem>
                  <ListItem
                    href="/about#operations-as-knowledge"
                    title="Operations as Knowledge"
                  >
                    How the system stores and uses knowledge about how to work
                    with knowledge, creating self-instructing operation hints.
                  </ListItem>
                  <ListItem href="/about#comparison" title="RAGE vs. RAG">
                    Compare Recursive Agentic Graph Embeddings with traditional
                    RAG and GraphRAG approaches across key features.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Documentation Link */}
            <NavigationMenuItem
              className={cn(
                menuItemTransition,
                // Stagger delay (adjust index if Home is hidden)
                isCompact
                  ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 5 : 4)}`
                  : isHovered
                    ? `opacity-100 delay-${hoverDelayBase * (pathname !== '/' ? 5 : 4)}`
                    : 'opacity-0'
              )}
            >
              <NavigationMenuLink asChild>
                <Link
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'transition-none',
                    isCompact ? 'h-9 px-2 text-sm' : ''
                  )}
                  href={getDocsUrl()}
                >
                  Docs
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Spacer - Pushes right-side items */}
      <div className="grow" />

      {/* Right side items container - Wrapped in TooltipProvider */}
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center space-x-2">
          {/* Demo Button (Only in Development) */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              className={menuItemTransition}
              onClick={openDemo}
              size={isCompact ? 'sm' : 'default'}
              variant="secondary"
            >
              {contentNav.demo}
            </Button>
          )}

          {/* Join Beta Button (Always Visible) */}
          <Button
            className={menuItemTransition}
            onClick={handleBetaClick}
            size={isCompact ? 'sm' : 'default'}
            variant="subtle"
          >
            {contentNav.beta}
          </Button>

          {/* Search Documentation Button */}
          <SearchToggle
            className={cn(
              menuItemTransition,
              isCompact ? 'h-9 w-9 p-0' : 'h-10 w-10 p-0'
            )}
            enableHotkey={true}
            placeholder="Search documentation..."
            size={isCompact ? 'sm' : 'default'}
            variant="ghost"
          />

          {/* FAQ "?" Button */}
          <Link href="/faq">
            <Button
              className={cn(
                menuItemTransition,
                isCompact ? 'h-9 w-9 p-0' : 'h-10 w-10 p-0'
              )}
              size={isCompact ? 'sm' : 'default'}
              variant="ghost"
            >
              FAQ
            </Button>
          </Link>

          {/* Theme Toggle Button (Always Visible) */}
          <ThemeToggleButton
            className={cn(
              menuItemTransition,
              isCompact ? 'h-9 w-9' : 'h-10 w-10'
            )}
          />
        </div>
      </TooltipProvider>
    </div>
  );
}
