import { HomeLayout } from "fumadocs-ui/layouts/home";
import { LargeSearchToggle } from "@/components/search-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: { children: React.ReactNode }) {
  const options = baseOptions();
  return (
    <HomeLayout
      {...options}
      // Add Dashboard link and user profile only on the home layout
      links={[
        { type: "main", text: "Dashboard", url: "/dashboard" },
        ...(options.links ?? []),
      ]}
      searchToggle={{
        enabled: true,
        components: {
          lg: <LargeSearchToggle customText="Search Documentation" />,
        },
      }}
      themeSwitch={{
        enabled: true,
        component: (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserProfile showDashboardLink />
          </div>
        ),
      }}
    >
      {children}
    </HomeLayout>
  );
}
