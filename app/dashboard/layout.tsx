import { Book, Brain } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { ProtectedContent } from "@/components/auth/protected";
import { DocsLayout } from "@/components/layout/docs";
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
      <AuthGate />
      <ProtectedContent>{children}</ProtectedContent>
    </DocsLayout>
  );
}
