import { Book, Brain } from "lucide-react";
import { DocsLayout } from "@/components/layout/docs";
import { documentationProvider } from "@/components/search/providers";
import { LargeSearchToggle } from "@/components/search/toggle";
import { docsOptions } from "@/lib/layout.shared";
import { docsSource } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const options = docsOptions();
  return (
    <DocsLayout
      {...options}
      // Use documentation search provider in docs section
      searchToggle={{
        enabled: true,
        components: {
          sm: (
            <LargeSearchToggle
              customText="Search Documentation"
              enableHotkey={false}
              placeholder="Search documentation..."
              provider={documentationProvider}
            />
          ),
          lg: (
            <LargeSearchToggle
              customText="Search Documentation"
              enableHotkey
              placeholder="Search documentation..."
              provider={documentationProvider}
            />
          ),
        },
      }}
      sidebar={{
        ...(options.sidebar ?? {}),
        tabs: [
          {
            title: "Documentation",
            url: "/docs",
            icon: <Book className="size-4" />,
          },
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: <Brain className="size-4" />,
          },
        ],
      }}
      tree={docsSource.pageTree}
    >
      {children}
    </DocsLayout>
  );
}
