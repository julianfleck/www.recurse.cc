import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  const options = baseOptions();
  return (
    <HomeLayout
      {...options}
      // Add Dashboard link and user profile only on the home layout
      links={[
        { type: "main", text: "Dashboard", url: "/dashboard" },
        ...(options.links ?? []),
      ]}
      themeSwitch={{
        enabled: true,
        component: (
          <div className="flex items-center gap-2">
            <ThemeToggle mode="light-dark-system" />
            <UserProfile showDashboardLink />
          </div>
        ),
      }}
    >
      {children}
    </HomeLayout>
  );
}
