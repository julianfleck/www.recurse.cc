import { Book, Brain } from "lucide-react";
import { DocsLayout } from "@/components/layout/docs";
import { LargeDocumentationSearchToggle } from "@/components/documentation-search";
import { docsOptions } from "@/lib/layout.shared";
import { docsSource } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  const options = docsOptions();
  return (
    <DocsLayout
      {...options}
      // Use documentation search for docs section
      searchToggle={{
        enabled: true,
        components: {
          lg: <LargeDocumentationSearchToggle customText="Search Documentation" />,
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
