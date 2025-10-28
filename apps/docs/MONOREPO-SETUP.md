# Monorepo Setup Guide for docs.recurse.cc

## Current Structure vs New Structure

### Current (Single App)
```
docs.recurse.cc/
├── app/
│   ├── (home)/          # Landing page
│   ├── docs/            # Documentation routes
│   └── dashboard/       # Dashboard routes
├── components/
├── content/
│   ├── docs/
│   └── dashboard/
└── package.json
```

### New (Monorepo)
```
docs.recurse.cc/
├── apps/
│   ├── www/             # www.recurse.cc
│   │   ├── app/
│   │   ├── package.json
│   │   └── next.config.mjs
│   ├── docs/            # docs.recurse.cc
│   │   ├── app/
│   │   ├── content/
│   │   ├── package.json
│   │   └── next.config.mjs
│   └── dashboard/       # dashboard.recurse.cc
│       ├── app/
│       ├── content/
│       ├── package.json
│       └── next.config.mjs
├── packages/
│   ├── ui/              # Shared UI components
│   ├── auth/            # Auth components & logic
│   ├── api/             # API client
│   └── config/          # Shared configs
├── pnpm-workspace.yaml
└── package.json
```

## Migration Steps

### 1. Initialize Monorepo Structure

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Create workspace file
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Update root package.json
```

### 2. Create Package Structure

```bash
# Create directories
mkdir -p apps/www apps/docs apps/dashboard
mkdir -p packages/ui packages/auth packages/api packages/config

# Initialize each package
cd apps/www && pnpm init
cd ../docs && pnpm init
cd ../dashboard && pnpm init
cd ../../packages/ui && pnpm init
cd ../auth && pnpm init
cd ../api && pnpm init
cd ../config && pnpm init
```

### 3. Move Existing Code

#### Apps Distribution:

**www/** (Landing page only)
- Minimal Next.js app
- Uses shared UI components
- No fumadocs, no auth

**docs/** (Documentation)
- Current `app/docs/` → `apps/docs/app/`
- Current `content/docs/` → `apps/docs/content/`
- Uses fumadocs
- Uses shared UI/auth components
- NO dashboard routes

**dashboard/** (Dashboard)
- Current `app/dashboard/` → `apps/dashboard/app/`
- Current `content/dashboard/` → `apps/dashboard/content/`
- Uses fumadocs
- Uses shared UI/auth/components
- Protected by auth

#### Packages Distribution:

**packages/ui/**
- All UI components from `components/ui/`
- Shared layout components

**packages/auth/**
- `components/auth/*`
- `lib/auth-*.ts`
- Auth store, providers

**packages/api/**
- `lib/api.ts`
- API types and clients

**packages/config/**
- `tailwind.config.js`
- `tsconfig.json` (shared)
- Biome/ESLint configs

## Vercel Configuration

### vercel.json per app

**apps/www/vercel.json**
```json
{
  "name": "www-recurse-cc",
  "git": {
    "deploymentEnabled": {
      "production": true
    }
  }
}
```

**apps/docs/vercel.json**
```json
{
  "name": "docs-recurse-cc",
  "git": {
    "deploymentEnabled": {
      "production": true
    }
  }
}
```

**apps/dashboard/vercel.json**
```json
{
  "name": "dashboard-recurse-cc",
  "git": {
    "deploymentEnabled": {
      "production": true
    }
  }
}
```

### Vercel Project Settings

1. Go to Vercel dashboard
2. Add each app as a separate project
3. For each app:
   - Connect to same GitHub repo
   - Set Root Directory to `apps/www`, `apps/docs`, or `apps/dashboard`
   - Set Build Command: `pnpm build`
   - Set Output Directory: `.next`
   - Add custom domain: `www.recurse.cc`, `docs.recurse.cc`, or `dashboard.recurse.cc`

## Shared Dependencies

### Root package.json
```json
{
  "name": "docs-recurse-cc-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter './apps/*' dev",
    "build": "pnpm --filter './apps/*' build",
    "lint": "biome check ."
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.2",
    "typescript": "^5.9.2"
  }
}
```

### Example: apps/docs/package.json
```json
{
  "name": "@recurse/docs",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start"
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

## Benefits

✅ **Clean separation**: Each app has its own domain and purpose
✅ **Shared code**: Maintain DRY principle with shared packages
✅ **Independent deployments**: Update docs without affecting dashboard
✅ **Better routing**: No need for weird subpath routes
✅ **Easier scaling**: Can move apps to different teams/infrastructure later
✅ **Type safety**: Shared types across all apps

## Next Steps

1. Set up monorepo structure
2. Migrate code to new structure
3. Test each app locally
4. Configure Vercel projects
5. Deploy and test DNS routing

## Alternative: Subdomain Routing in Single App

If you want to keep everything in one app (less recommended), you can use Next.js middleware to route based on subdomain:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  const subdomain = hostname.split('.')[0];
  
  if (subdomain === 'dashboard') {
    // Route to dashboard
    url.pathname = `/dashboard${url.pathname}`;
  } else if (subdomain === 'docs') {
    // Route to docs
    url.pathname = `/docs${url.pathname}`;
  } else if (subdomain === 'www' || !subdomain) {
    // Route to home
    url.pathname = `/`;
  }
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

However, this approach is messy and you still have the path-based routing issue.

