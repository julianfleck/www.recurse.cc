# Routing Options Comparison

## Option 1: Monorepo (Recommended) ⭐

### Structure
```
monorepo/
├── apps/
│   ├── www/              → www.recurse.cc
│   ├── docs/             → docs.recurse.cc
│   └── dashboard/        → dashboard.recurse.cc
└── packages/
    ├── ui/               (shared components)
    ├── auth/             (shared auth)
    └── api/              (shared API client)
```

### Pros
- ✅ Clean separation of concerns
- ✅ Each app deploys independently
- ✅ Share code via packages
- ✅ Each domain routes independently
- ✅ Easy to scale/manage

### Cons
- ⚠️ More initial setup
- ⚠️ Need to manage workspace dependencies

### Vercel Setup
```bash
# Three separate Vercel projects
vercel add app www.recurse.cc
  → Root: apps/www
  
vercel add app docs.recurse.cc
  → Root: apps/docs
  
vercel add app dashboard.recurse.cc
  → Root: apps/dashboard
```

---

## Option 2: Separate Repos

### Structure
```
www.recurse.cc/           (separate repo)
docs.recurse.cc/          (separate repo)
dashboard.recurse.cc/     (separate repo)
```

### Pros
- ✅ Maximum isolation
- ✅ Simplest per-repo structure
- ✅ Independent deployments per repo

### Cons
- ❌ Cannot share code easily
- ❌ Maintain three copies of shared components
- ❌ Harder to keep in sync
- ❌ More repositories to manage

### Vercel Setup
```bash
# Three separate GitHub repos, three Vercel projects
# Each repo connects to its own Vercel project
```

---

## Option 3: Single App with Middleware (Not Recommended)

### Structure
```
docs.recurse.cc/
├── app/
│   ├── (home)/           # Serves www.recurse.cc and root
│   ├── docs/             # Serves docs.recurse.cc
│   └── dashboard/        # Serves dashboard.recurse.cc
└── middleware.ts         # Routes by subdomain
```

### Pros
- ✅ Single repo and deployment
- ✅ Share everything trivially

### Cons
- ❌ Still has path-based routing (www.recurse.cc/docs/)
- ❌ Complex middleware logic
- ❌ Single point of failure
- ❌ Can't deploy independently
- ❌ Auth context mixing

---

## Recommendation: Monorepo (Option 1)

Best balance of separation and code sharing for your needs.

### Quick Start

```bash
# 1. Create monorepo structure
mkdir docs.recurse.cc-mono
cd docs.recurse.cc-mono

# 2. Clone current repo
git clone <current-repo> current
mv current/* .
rm -rf current

# 3. Restructure (see MONOREPO-SETUP.md for details)
# 4. Set up pnpm workspace
# 5. Configure Vercel projects

# Each app runs independently:
cd apps/www && pnpm dev      # → localhost:3000
cd apps/docs && pnpm dev     # → localhost:3001
cd apps/dashboard && pnpm dev # → localhost:3002
```

### Migration Checklist

- [ ] Set up pnpm workspace
- [ ] Create apps/www, apps/docs, apps/dashboard
- [ ] Create packages/ui, packages/auth, packages/api
- [ ] Move code to appropriate apps/packages
- [ ] Update imports to use workspace packages
- [ ] Configure each app's next.config.mjs
- [ ] Create Vercel projects for each app
- [ ] Set DNS records
- [ ] Test each subdomain
- [ ] Deploy

### Estimated Timeline
- Initial setup: 2-4 hours
- Code migration: 4-8 hours
- Testing & deployment: 2-4 hours
- **Total: 1-2 days**

