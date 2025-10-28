# Simplified Dashboard Integration Plan

## Overview

**Goal**: Integrate the dashboard directly into the existing Fumadocs project and rename it to `recurse.cc`

**Current**: `docs.recurse.cc` (Fumadocs docs site)  
**Target**: `recurse.cc` (unified site with docs + dashboard)  
**Approach**: Add dashboard as routes within existing Next.js app  
**Timeline**: 2-3 weeks instead of 4 weeks

---

## **Phase 1: Project Setup & Renaming (Week 1)**

### 1.1 Rename Project
```bash
# Rename the directory
mv docs.recurse.cc recurse.cc

# Update package.json
{
  "name": "recurse.cc",
  "description": "Recurse.cc - Unified documentation and dashboard platform"
}
```

### 1.2 Create Dashboard Directory Structure
```
/recurse.cc/
├── app/
│   ├── (home)/           # Landing page
│   ├── docs/            # Existing Fumadocs routes
│   ├── dashboard/       # NEW: Dashboard routes
│   │   ├── page.tsx
│   │   ├── graph/page.tsx
│   │   ├── content/page.tsx
│   │   ├── usage/page.tsx
│   │   └── layout.tsx   # Dashboard-specific layout
│   ├── api/             # Combined API routes
│   └── login/page.tsx   # Auth pages
├── components/
│   ├── dashboard/       # NEW: Dashboard components
│   ├── shared/          # Shared components
│   └── ui/              # Existing UI components
├── lib/
│   ├── auth.ts          # NEW: Auth utilities
│   ├── api.ts           # NEW: API client
│   └── source.ts        # Existing Fumadocs source
```

### 1.3 Update Landing Page
```tsx
// app/(home)/page.tsx
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">Welcome to Recurse.cc</h1>
      <div className="space-y-4">
        <p className="text-fd-muted-foreground">
          Turn your documents into living context for AI systems
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/docs"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Documentation
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

## **Phase 2: Dashboard Integration (Week 1-2)**

### 2.1 Copy Dashboard Components
```bash
# Copy dashboard components
cp -r ../dashboard.recurse.cc/src/components/* components/dashboard/

# Copy dashboard pages
cp -r ../dashboard.recurse.cc/src/app/(authenticated)/* app/dashboard/

# Copy hooks and utilities
cp -r ../dashboard.recurse.cc/src/hooks/* lib/
cp -r ../dashboard.recurse.cc/src/lib/* lib/
```

### 2.2 Update Import Paths
```typescript
// Before (dashboard)
import { AppSidebar } from '@/components/app-sidebar';

// After (integrated)
import { AppSidebar } from '@/components/dashboard/app-sidebar';
```

### 2.3 Create Shared Layout System
```tsx
// app/dashboard/layout.tsx
'use client';

import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [token, router]);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <main className="flex-1">{children}</main>
    </SidebarProvider>
  );
}
```

### 2.4 Authentication Setup
```typescript
// lib/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

## **Phase 3: Dependency Consolidation (Week 2)**

### 3.1 Update package.json
```json
{
  "name": "recurse.cc",
  "dependencies": {
    // Existing Fumadocs deps
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "fumadocs-core": "15.7.10",
    "fumadocs-mdx": "11.9.0",
    "fumadocs-ui": "15.7.10",

    // Dashboard deps (add these)
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/modifiers": "^9.0.0",
    "@dnd-kit/sortable": "^10.0.0",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@xyflow/react": "^12.8.3",
    "d3": "^7.9.0",
    "d3-force": "^3.0.0",
    "dagre": "^0.8.5",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.23.12",
    "lucide-react": "^0.542.0",
    "motion": "^12.23.12",
    "react-markdown": "^9.1.0",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "ts-key-enum": "^3.0.13",
    "vaul": "^1.1.2",
    "zod": "^4.0.17",
    "zustand": "^5.0.8"
  }
}
```

### 3.2 Resolve Conflicts
```bash
# Check for version conflicts
npm ls @radix-ui/react-dialog
npm ls @radix-ui/react-avatar

# Update conflicting versions to latest
npm update @radix-ui/react-dialog @radix-ui/react-avatar
```

### 3.3 Update TypeScript Configuration
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/components/dashboard/*": ["./components/dashboard/*"]
    }
  }
}
```

---

## **Phase 4: Routing & Navigation (Week 2)**

### 4.1 Update Root Layout
```tsx
// app/layout.tsx
import { RootProvider } from "fumadocs-ui/provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import "./global.css";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <RootProvider>{children}</RootProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4.2 Create Auth Provider
```tsx
// lib/auth.tsx
'use client';

import { useAuthStore } from './auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth store on mount
  useAuthStore();

  return <>{children}</>;
}
```

### 4.3 Update Fumadocs Layout
```tsx
// app/docs/layout.tsx
import { DocsLayout } from "@/components/layout/docs";
import { docsOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout {...docsOptions()} tree={source.pageTree}>
      {children}
    </DocsLayout>
  );
}
```

---

## **Phase 5: Testing & Deployment (Week 2-3)**

### 5.1 Testing Strategy
```bash
# Test both sections
npm run dev

# Test routes
curl http://localhost:3000/          # Landing page
curl http://localhost:3000/docs      # Documentation
curl http://localhost:3000/dashboard # Dashboard (redirects to login)
```

### 5.2 Build Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    outputFileTracingRoot: undefined,
  },
  transpilePackages: [],

  // Handle both docs and dashboard routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default config;
```

### 5.3 Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.recurse.cc
NEXT_PUBLIC_DOCS_URL=https://docs.recurse.cc

# Auth configuration
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://recurse.cc

# Dashboard API
DASHBOARD_API_URL=https://api.recurse.cc
```

### 5.4 Deployment
```bash
# Build and deploy
npm run build
npm run start

# Or with Docker
docker build -t recurse.cc .
docker run -p 3000:3000 recurse.cc
```

---

## **Migration Steps**

### Step 1: Project Renaming
```bash
cd /Users/julian/Tresors/Privat/Code/
mv docs.recurse.cc recurse.cc
cd recurse.cc
```

### Step 2: Component Migration
```bash
# Create dashboard directories
mkdir -p app/dashboard components/dashboard lib

# Copy dashboard components (manual process)
cp -r ../dashboard.recurse.cc/src/components/* components/dashboard/
cp -r ../dashboard.recurse.cc/src/app/(authenticated)/* app/dashboard/
cp ../dashboard.recurse.cc/src/app/login/page.tsx app/login/
```

### Step 3: Dependency Updates
```bash
# Install dashboard dependencies
npm install @dnd-kit/core @dnd-kit/modifiers @dnd-kit/sortable @xyflow/react d3 d3-force dagre date-fns framer-motion motion react-markdown recharts sonner ts-key-enum vaul

# Update existing deps if needed
npm update @radix-ui/react-dialog @radix-ui/react-avatar
```

### Step 4: Configuration Updates
```bash
# Update package.json name
sed -i '' 's/"name": "docs.recurse.cc"/"name": "recurse.cc"/' package.json

# Update import paths (bulk find/replace)
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/@\/components\//components\//g'
```

### Step 5: Testing
```bash
npm run build
npm run dev

# Test all routes:
# http://localhost:3000/ - Landing
# http://localhost:3000/docs - Documentation
# http://localhost:3000/dashboard - Dashboard (auth required)
```

---

## **Success Criteria**

- [ ] Project renamed to `recurse.cc`
- [ ] Landing page shows both docs and dashboard links
- [ ] `/docs/*` routes work with Fumadocs
- [ ] `/dashboard/*` routes work with authentication
- [ ] Shared components work across both sections
- [ ] Build process completes successfully
- [ ] All routes are accessible and functional

---

## **Benefits of This Approach**

✅ **Simpler**: Single Next.js app, no monorepo complexity  
✅ **Faster**: 2-3 weeks vs 4 weeks timeline  
✅ **Easier Maintenance**: One codebase, one deployment  
✅ **Shared Resources**: Common components, auth, theming  
✅ **Gradual Migration**: Can migrate features incrementally  
✅ **Unified Experience**: Single domain, consistent branding  

---

**Document Version**: 2.0 (Simplified)  
**Last Updated**: September 17, 2025  
**Authors**: AI Assistant  
**Reviewers**: Development Team
