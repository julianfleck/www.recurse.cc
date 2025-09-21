import { Book, Brain } from "lucide-react";
import { ProtectedContent } from "@/components/auth/protected";
import { DocsLayout } from "@/components/layout/docs";
import { knowledgeBaseProvider } from "@/components/search/providers";
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
      // Use knowledge base search provider in dashboard
      searchToggle={{
        enabled: true,
        components: {
          sm: (
            <LargeSearchToggle
              customText="Search Knowledge Base"
              enableHotkey={false}
              placeholder="Search knowledge base..."
              provider={knowledgeBaseProvider}
            />
          ),
          lg: (
            <LargeSearchToggle
              customText="Search Knowledge Base"
              enableHotkey
              placeholder="Search knowledge base..."
              provider={knowledgeBaseProvider}
            />
          ),
        },
      }}
      // Render children pages directly; page content controls header/footer via DocsPage
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
        footer: <DocumentCountStatus />,
      }}
      tree={dashboardSource.pageTree}
    >
      <ProtectedContent>{children}</ProtectedContent>
    </DocsLayout>
  );
}
