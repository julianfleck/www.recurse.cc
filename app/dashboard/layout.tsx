import { Book, Brain } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { DocsLayout } from "@/components/layout/docs";
import { docsOptions } from "@/lib/layout.shared";
import { dashboardSource } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/dashboard">) {
  return (
    <DocsLayout
      {...docsOptions()}
      disableDocActions
      // Render children pages directly; page content controls header/footer via DocsPage
      sidebar={{
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
      tree={dashboardSource.pageTree}
    >
      <AuthGate />
      {children}
    </DocsLayout>
  );
}
