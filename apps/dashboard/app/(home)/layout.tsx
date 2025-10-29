import { Book, Brain } from "lucide-react";
import { ProtectedContent } from "@/components/auth/protected";
import { DocsLayout } from "@/components/layout/docs";
import { LargeSearchToggle } from "@/components/search/toggle";
import { DocumentCountStatus } from "@/components/status-components";
import { docsOptions } from "@/lib/layout.shared";
import { dashboardSource } from "@/lib/source";

export default function Layout({ children }: { children: React.ReactNode }) {
  const options = docsOptions();
  return (
    <DocsLayout
      {...options}
      disableDocActions
      searchText="Search Knowledge Base"
      searchToggle={{
        enabled: true,
        components: {
          sm: (
            <LargeSearchToggle
              customText="Search"
              enableHotkey={false}
              placeholder="Search..."
              providerKey="knowledgeBase"
            />
          ),
          lg: (
            <LargeSearchToggle
              customText="Search Knowledge Base"
              enableHotkey
              placeholder="Search knowledge base..."
              providerKey="knowledgeBase"
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
            url: "/",
            icon: <Brain className="size-4" />,
          },
        ],
        footer: <DocumentCountStatus />,
      }}
      tree={dashboardSource.pageTree}
    >
      <ProtectedContent>{children}</ProtectedContent>
    </DocsLayout>
  );
}

