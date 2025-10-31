import { HomeLayout } from "fumadocs-ui/layouts/home";
import { documentationProvider } from "@/components/search/providers";
import { LargeSearchToggle } from "@/components/search/toggle";
import { ThemeToggle } from "@recurse/ui/components/theme-toggle";
import { UserProfile } from "@/components/user-profile";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: { children: React.ReactNode }) {
  const options = baseOptions();
  return (
    <HomeLayout
      {...options}
      searchToggle={{
        enabled: true,
        components: {
          sm: (
            <LargeSearchToggle
              customText="Search Documentation"
              enableHotkey={false}
              placeholder="Search documentation..."
              providerKey="documentation"
            />
          ),
          lg: (
            <LargeSearchToggle
              customText="Search Documentation"
              enableHotkey
              placeholder="Search documentation..."
              providerKey="documentation"
            />
          ),
        },
      }}
      themeSwitch={{
        enabled: true,
        component: (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserProfile />
          </div>
        ),
      }}
    >
      {children}
    </HomeLayout>
  );
}
