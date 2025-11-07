"use client";

import { ProgressCircle } from "@recurse/ui/components/progress-circle";
import { IconCalendarWeek } from "@tabler/icons-react";
import {
  type BreadcrumbOptions,
  getBreadcrumbItemsFromPath,
} from "fumadocs-core/breadcrumb";
import { createContext, usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type { PageTree } from "fumadocs-core/server";
import { useActiveAnchor } from "fumadocs-core/toc";
import { useEffectEvent } from "fumadocs-core/utils/use-effect-event";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useNav } from "fumadocs-ui/contexts/layout";
import { useSidebar } from "fumadocs-ui/contexts/sidebar";
import { useTreeContext, useTreePath } from "fumadocs-ui/contexts/tree";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ComponentProps,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../../lib/cn";
import { isActive } from "../../../lib/is-active";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { Pill, PillStatus } from "../../ui/kibo-ui/pill";
import { useTOCItems } from "../../ui/toc";

const TocPopoverContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>("TocPopoverContext");

export function PageTOCPopoverTrigger(props: ComponentProps<"button">) {
  const { text } = useI18n();
  const { open } = TocPopoverContext.use();
  const items = useTOCItems();
  const active = useActiveAnchor();
  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active]
  );
  const { root } = useTreeContext();
  const treePath = useTreePath();
  const breadcrumbLabel = useMemo(() => {
    const items = getBreadcrumbItemsFromPath(root, treePath, {
      includePage: true,
    });
    if (items.length === 0) {
      return;
    }
    return items.map((i) => i.name).join(" / ");
  }, [root, treePath]);
  const showItem = selected !== -1 && !open;

  return (
    <CollapsibleTrigger
      {...props}
      className={cn(
        "flex h-(--fd-tocnav-height) w-full items-center gap-2.5 px-4 py-2.5 text-start text-fd-muted-foreground text-sm focus-visible:outline-none md:px-6 [&_svg]:size-4",
        props.className
      )}
    >
      <ProgressCircle
        className={cn("shrink-0", open && "text-fd-primary")}
        max={1}
        value={(selected + 1) / Math.max(1, items.length)}
      />
      <span className="grid flex-1 *:col-start-1 *:row-start-1 *:my-auto">
        <span
          className={cn(
            "truncate transition-all",
            open && "text-fd-foreground",
            showItem && "-translate-y-full pointer-events-none opacity-0"
          )}
        >
          {breadcrumbLabel ?? text.toc}
        </span>
        <span
          className={cn(
            "truncate transition-all",
            !showItem && "pointer-events-none translate-y-full opacity-0"
          )}
        >
          {items[selected]?.title}
        </span>
      </span>
      <ChevronDown
        className={cn(
          "mx-0.5 shrink-0 transition-transform",
          open && "rotate-180"
        )}
      />
    </CollapsibleTrigger>
  );
}

export function PageTOCPopoverContent(props: ComponentProps<"div">) {
  return (
    <CollapsibleContent
      data-toc-popover=""
      {...props}
      className={cn("flex max-h-[50vh] flex-col px-4 md:px-6", props.className)}
    >
      {props.children}
    </CollapsibleContent>
  );
}

export function PageTOCPopover(props: ComponentProps<"div">) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { collapsed } = useSidebar();
  const { isTransparent } = useNav();

  const onClick = useEffectEvent((e: Event) => {
    if (!open) {
      return;
    }

    if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
      setOpen(false);
    }
  });

  useEffect(() => {
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [onClick]);

  return (
    <TocPopoverContext.Provider
      value={useMemo(
        () => ({
          open,
          setOpen,
        }),
        [open]
      )}
    >
      <Collapsible asChild onOpenChange={setOpen} open={open}>
        <header
          id="nd-tocnav"
          ref={ref}
          {...props}
          className={cn(
            "fixed z-10 border-b pr-(--removed-body-scroll-bar-size,0) backdrop-blur-sm transition-colors xl:hidden max-xl:on-root:[--fd-tocnav-height:40px]",
            (!isTransparent || open) && "bg-fd-background/80",
            open && "shadow-lg",
            props.className
          )}
          style={{
            ...props.style,
            top: "calc(var(--fd-banner-height) + var(--fd-nav-height))",
            insetInlineStart: collapsed
              ? "0px"
              : "calc(var(--fd-sidebar-width) + var(--fd-layout-offset))",
            insetInlineEnd: 0,
          }}
        >
          {props.children}
        </header>
      </Collapsible>
    </TocPopoverContext.Provider>
  );
}

export function PageLastUpdate({
  date: value,
  ...props
}: Omit<ComponentProps<"p">, "children"> & { date: Date | string }) {
  const { text } = useI18n();
  const [date, setDate] = useState("");

  useEffect(() => {
    // to the timezone of client
    setDate(new Date(value).toLocaleDateString());
  }, [value]);

  return (
    <Pill
      {...props}
      className="w-fit border border-border bg-card opacity-50 transition-opacity hover:opacity-100"
    >
      <PillStatus>
        <IconCalendarWeek className="text-muted-foreground" size={14} />
        Last Update
      </PillStatus>
      <span className="text-xs">{date}</span>
    </Pill>
  );
}

type Item = Pick<PageTree.Item, "name" | "description" | "url">;
export interface FooterProps extends ComponentProps<"div"> {
  /**
   * Items including information for the next and previous page
   */
  items?: {
    previous?: Item;
    next?: Item;
  };
}

function scanNavigationList(tree: PageTree.Node[]) {
  const list: PageTree.Item[] = [];

  tree.forEach((node) => {
    if (node.type === "folder") {
      if (node.index) {
        list.push(node.index);
      }

      list.push(...scanNavigationList(node.children));
      return;
    }

    if (node.type === "page" && !node.external) {
      list.push(node);
    }
  });

  return list;
}

const listCache = new Map<string, PageTree.Item[]>();

export function PageFooter({ items, ...props }: FooterProps) {
  const { root } = useTreeContext();
  const pathname = usePathname();

  const { previous, next } = useMemo(() => {
    if (items) {
      return items;
    }

    const cached = listCache.get(root.$id);
    const list = cached ?? scanNavigationList(root.children);
    listCache.set(root.$id, list);

    const idx = list.findIndex((item) => isActive(item.url, pathname, false));

    if (idx === -1) {
      return {};
    }
    return {
      previous: list[idx - 1],
      next: list[idx + 1],
    };
  }, [items, pathname, root]);

  return (
    <div
      {...props}
      className={cn(
        "not-prose",
        "group/page-footer @container mt-12 grid gap-4 pb-6",
        previous && next ? "grid-cols-2" : "grid-cols-1",
        props.className
      )}
    >
      {previous ? <FooterItem index={0} item={previous} /> : null}
      {next ? <FooterItem index={1} item={next} /> : null}
    </div>
  );
}

function FooterItem({ item, index }: { item: Item; index: 0 | 1 }) {
  const { text } = useI18n();
  const Icon = index === 0 ? ChevronLeft : ChevronRight;

  return (
    <Link
      className={cn(
        "@max-lg:col-span-full flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground",
        index === 1 && "text-end"
      )}
      href={item.url}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5 font-medium",
          index === 1 && "flex-row-reverse"
        )}
      >
        <Icon className="-mx-1 size-4 shrink-0 rtl:rotate-180" />
        <p>{item.name}</p>
      </div>
      <p className="truncate text-fd-muted-foreground">
        {item.description ?? (index === 0 ? text.previousPage : text.nextPage)}
      </p>
    </Link>
  );
}

export type BreadcrumbProps = BreadcrumbOptions & ComponentProps<"div">;

export function PageBreadcrumb({
  includeRoot = false,
  includeSeparator,
  includePage = true,
  ...props
}: BreadcrumbProps) {
  const path = useTreePath();
  const { root } = useTreeContext();
  const items = useMemo(() => {
    return getBreadcrumbItemsFromPath(root, path, {
      includePage,
      includeSeparator,
      includeRoot,
    });
  }, [includePage, includeRoot, includeSeparator, path, root]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      {...props}
      className={cn(
        "flex items-center gap-1.5 text-fd-muted-foreground text-sm",
        props.className
      )}
    >
      {items.map((item, i) => {
        const className = cn(
          "truncate",
          i === items.length - 1 && "font-medium text-fd-foreground"
        );

        return (
          <Fragment key={i}>
            {i !== 0 && <ChevronRight className="size-3.5 shrink-0" />}
            {item.url ? (
              <Link
                className={cn(className, "transition-opacity hover:opacity-80")}
                href={item.url}
              >
                {item.name}
              </Link>
            ) : (
              <span className={className}>{item.name}</span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export function PageTOC(props: ComponentProps<"div">) {
  const { collapsed } = useSidebar();
  const offset = collapsed ? "0px" : "var(--fd-layout-offset)";

  return (
    <div
      id="nd-toc"
      {...props}
      className={cn(
        "fixed bottom-0 pt-12 pr-(--removed-body-scroll-bar-size,0) pb-2 max-xl:hidden",
        props.className
      )}
      style={{
        ...props.style,
        top: "calc(var(--fd-banner-height) + var(--fd-nav-height))",
        insetInlineEnd: `max(${offset}, calc(50vw - var(--fd-sidebar-width)/2 - var(--fd-page-width)/2))`,
      }}
    >
      <div className="flex h-full w-(--fd-toc-width) max-w-full flex-col pe-4">
        {props.children}
      </div>
    </div>
  );
}
