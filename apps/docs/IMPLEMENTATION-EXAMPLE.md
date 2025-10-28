# Implementation Example: Converting to Monorepo

## Step-by-Step Code Migration

### 1. Root Package Structure

**pnpm-workspace.yaml**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**package.json** (root)
```json
{
  "name": "docs-recurse-cc-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter './apps/*' dev",
    "build": "pnpm --filter './apps/*' build",
    "lint": "biome check .",
    "type-check": "pnpm --filter './apps/*' exec tsc --noEmit"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.2",
    "typescript": "^5.9.2"
  }
}
```

---

### 2. Shared UI Package

**packages/ui/package.json**
```json
{
  "name": "@recurse/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": "./index.ts",
    "./button": "./components/button.tsx",
    "./card": "./components/card.tsx"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "peerDependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

**packages/ui/index.ts**
```typescript
export { Button } from './components/button';
export { Card } from './components/card';
// ... other exports
```

---

### 3. Shared Auth Package

**packages/auth/package.json**
```json
{
  "name": "@recurse/auth",
  "version": "0.0.0",
  "private": true,
  "main": "./index.ts",
  "dependencies": {
    "@auth0/auth0-react": "^2.5.0",
    "next-auth": "^4.24.11",
    "zustand": "^5.0.8"
  },
  "peerDependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

**packages/auth/index.ts**
```typescript
export { Auth0Provider } from './providers';
export { ProtectedContent } from './components/protected';
export { useAuthStore } from './store/auth-store';
export type { AuthState } from './types';
```

---

### 4. Docs App (docs.recurse.cc)

**apps/docs/package.json**
```json
{
  "name": "@recurse/docs",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo -p 3001",
    "build": "next build",
    "start": "next start",
    "postinstall": "fumadocs-mdx"
  },
  "dependencies": {
    "@recurse/ui": "workspace:*",
    "fumadocs-core": "15.7.10",
    "fumadocs-mdx": "11.9.0",
    "fumadocs-ui": "15.7.10",
    "next": "15.5.2",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

**apps/docs/app/layout.tsx**
```typescript
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { RootProvider } from "fumadocs-ui/provider";
import "@/app/global.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ enabled: true }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
```

**apps/docs/app/page.tsx**
```typescript
import { redirect } from 'next/navigation';

export default function DocsHome() {
  // Redirect to introduction
  redirect('/docs/introduction');
}
```

**apps/docs/app/docs/[[...slug]]/page.tsx**
```typescript
import { getPageTree } from '@/lib/source';
import { DocsPage } from 'fumadocs-ui/page';
import { DocsLayout } from '@/components/layout/docs';

export default async function DocsPage({ params }: { params: { slug?: string[] } }) {
  const tree = getPageTree();
  const page = getPage(params.slug);
  
  return (
    <DocsLayout tree={tree}>
      <DocsPage toc={page.data.toc} full={page.data.full}>
        {page.content}
      </DocsPage>
    </DocsLayout>
  );
}
```

---

### 5. Dashboard App (dashboard.recurse.cc)

**apps/dashboard/package.json**
```json
{
  "name": "@recurse/dashboard",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo -p 3002",
    "build": "next build",
    "start": "next start",
    "postinstall": "fumadocs-mdx"
  },
  "dependencies": {
    "@recurse/ui": "workspace:*",
    "@recurse/auth": "workspace:*",
    "@recurse/api": "workspace:*",
    "fumadocs-core": "15.7.10",
    "fumadocs-mdx": "11.9.0",
    "fumadocs-ui": "15.7.10",
    "next": "15.5.2",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

**apps/dashboard/app/layout.tsx**
```typescript
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Auth0Provider } from "@recurse/auth";
import { RootProvider } from "fumadocs-ui/provider";
import "@/app/global.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Auth0Provider
          authorizationParams={{
            redirect_uri: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard`,
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          }}
          clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? ""}
          domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""}
        >
          <RootProvider search={{ enabled: false }}>
            {children}
          </RootProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
```

**apps/dashboard/app/dashboard/[[...slug]]/page.tsx**
```typescript
import { ProtectedContent } from "@recurse/auth";
import { getPageTree } from '@/lib/source';
import { DocsPage } from 'fumadocs-ui/page';
import { DocsLayout } from '@/components/layout/docs';

export default async function DashboardPage({ params }: { params: { slug?: string[] } }) {
  const tree = getPageTree();
  const page = getPage(params.slug);
  
  return (
    <DocsLayout tree={tree}>
      <ProtectedContent>
        <DocsPage toc={page.data.toc} full={page.data.full}>
          {page.content}
        </DocsPage>
      </ProtectedContent>
    </DocsLayout>
  );
}
```

---

### 6. WWW App (www.recurse.cc)

**apps/www/package.json**
```json
{
  "name": "@recurse/www",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo -p 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@recurse/ui": "workspace:*",
    "next": "15.5.2",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

**apps/www/app/page.tsx**
```typescript
import Link from "next/link";
import { Button } from "@recurse/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 font-bold text-2xl">Welcome to Recurse.cc</h1>
      <p className="mb-8 text-fd-muted-foreground">
        Turn your documents into living context for AI systems
      </p>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="https://docs.recurse.cc">📚 Documentation</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="https://dashboard.recurse.cc">🧠 Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
```

---

### 7. Shared Tailwind Config

**packages/config/tailwind.config.ts**
```typescript
import type { Config } from "tailwindcss";

export const sharedConfig: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // shared theme
    },
  },
  plugins: [],
};
```

Each app imports and extends:
```typescript
import { sharedConfig } from "@recurse/config/tailwind.config";

export default {
  ...sharedConfig,
  // app-specific overrides
} satisfies Config;
```

---

### 8. Development Workflow

```bash
# Install all dependencies
pnpm install

# Run all apps in parallel
pnpm dev

# Or run individually
cd apps/www && pnpm dev        # http://localhost:3000
cd apps/docs && pnpm dev       # http://localhost:3001
cd apps/dashboard && pnpm dev  # http://localhost:3002

# Build all apps
pnpm build

# Run linting
pnpm lint
```

---

### 9. Vercel Deployment

**apps/docs/vercel.json**
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=@recurse/docs",
  "installCommand": "cd ../.. && pnpm install",
  "devCommand": "cd ../.. && pnpm dev --filter=@recurse/docs"
}
```

**apps/dashboard/vercel.json**
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build --filter=@recurse/dashboard",
  "installCommand": "cd ../.. && pnpm install",
  "devCommand": "cd ../.. && pnpm dev --filter=@recurse/dashboard"
}
```

---

### 10. Import Differences

**Before (single app)**
```typescript
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/components/auth/auth-store";
```

**After (monorepo)**
```typescript
import { Button } from "@recurse/ui/button";
import { useAuthStore } from "@recurse/auth";
```

