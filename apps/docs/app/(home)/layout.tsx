import { HomeLayout } from "fumadocs-ui/layouts/home";
import { documentationProvider } from "@/components/search/providers";
import { LargeSearchToggle } from "@/components/search/toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
        component: <ThemeToggle />,
      }}
    >
      {children}
    </HomeLayout>
  );
}
