"use client";

import type { AnchorProviderProps } from "fumadocs-core/toc";
import { useActiveAnchor } from "fumadocs-core/toc";
import { I18nLabel } from "fumadocs-ui/contexts/i18n";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { cn } from "../../../lib/cn";
import { ProgressCircle } from "../../ui/progress-circle";
import {
  TOCItems,
  TOCProvider,
  TOCScrollArea,
  useTOCItems,
} from "../../ui/toc";
import ClerkTOCItems from "../../ui/toc-clerk";
import {
  type BreadcrumbProps,
  type FooterProps,
  PageBreadcrumb,
  PageFooter,
  PageLastUpdate,
  PageTOC,
  PageTOCPopover,
  PageTOCPopoverContent,
  PageTOCPopoverTrigger,
} from "./page-client";

export function PageTOCTitle(props: ComponentProps<"h2">) {
  const items = useTOCItems();
  const active = useActiveAnchor();
  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active]
  );

  return (
    <h3
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 text-fd-muted-foreground text-sm",
        props.className
      )}
    >
      <ProgressCircle
        className="-ml-1.5"
        max={1}
        size={16}
		strokeWidth={1}
        value={(selected + 1) / Math.max(1, items.length)}
      />
	  <div className="pl-1.5">
	      <I18nLabel label="toc" />
	  </div>
    </h3>
  );
}

export function PageTOCItems({
  variant = "normal",
  ...props
}: ComponentProps<"div"> & { variant?: "clerk" | "normal" }) {
  return (
    <TOCScrollArea {...props}>
      {variant === "clerk" ? <ClerkTOCItems /> : <TOCItems />}
    </TOCScrollArea>
  );
}

export function PageTOCPopoverItems({
  variant = "normal",
  ...props
}: ComponentProps<"div"> & { variant?: "clerk" | "normal" }) {
  return (
    <TOCScrollArea {...props}>
      {variant === "clerk" ? <ClerkTOCItems /> : <TOCItems />}
    </TOCScrollArea>
  );
}

export function PageArticle(props: ComponentProps<"article">) {
  return (
    <article
      {...props}
      className={cn(
        "md:!pr-16 flex w-full min-w-0 flex-col gap-4 px-4 pt-8 md:px-12",
        props.className
      )}
    >
      {props.children}
    </article>
  );
}

export interface RootProps extends ComponentProps<"div"> {
  toc?: Omit<AnchorProviderProps, "children"> | false;
}

export function PageRoot({ toc = false, children, ...props }: RootProps) {
  const content = (
    <div
      id="nd-page"
      {...props}
      className={cn(
        "flex w-full max-w-(--fd-page-width) flex-1 pe-(--fd-toc-width) pt-(--fd-tocnav-height)",
        props.className
      )}
    >
      {children}
    </div>
  );

  if (toc) {
    return <TOCProvider {...toc}>{content}</TOCProvider>;
  }
  return content;
}

export {
  PageBreadcrumb,
  PageFooter,
  PageLastUpdate,
  PageTOC,
  PageTOCPopover,
  PageTOCPopoverTrigger,
  PageTOCPopoverContent,
  type FooterProps,
  type BreadcrumbProps,
};
