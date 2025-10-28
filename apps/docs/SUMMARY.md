# Summary: Routing Structure Analysis & Recommendations

## Your Questions Answered

### 1. "Is there a way we can route the dashboard to dashboard.recurse.cc and the docs stay at docs.recurse.cc?"

**Yes!** Using a **monorepo with separate Next.js apps** is the best approach.

**Current:** Both dashboard and docs live under `docs.recurse.cc/dashboard` and `docs.recurse.cc/docs`

**New:** 
- `www.recurse.cc` → Landing page app
- `docs.recurse.cc` → Documentation app  
- `dashboard.recurse.cc` → Dashboard app

Each app is deployed independently to its own Vercel project and subdomain.

---

### 2. "What's a good way to separate concerns?"

**Recommended:** Monorepo structure

```
monorepo/
├── apps/
│   ├── www/              (www.recurse.cc)
│   ├── docs/             (docs.recurse.cc)
│   └── dashboard/        (dashboard.recurse.cc)
└── packages/
    ├── ui/               (shared components)
    ├── auth/             (shared auth)
    └── api/              (shared API client)
```

**Benefits:**
- Clean separation: Each app has a single responsibility
- Shared code: DRY principle via packages
- Independent deployments: Update docs without affecting dashboard
- Type safety: Shared TypeScript types across apps
- Easy to scale: Move apps to different teams/infrastructure later

---

### 3. "I'd like to use the fumadocs template we have here for all three"

**All three apps can use fumadocs:**

- **www.recurse.cc**: Can use fumadocs UI components, but likely doesn't need the full MDX setup
- **docs.recurse.cc**: Full fumadocs (what you have now)
- **dashboard.recurse.cc**: Full fumadocs (what you have now)

Each app imports fumadocs independently in its own `package.json`.

---

### 4. "What's a good way to set this up? Monorepo?"

**Yes, monorepo is the best choice** for your use case.

**Why not separate repos?**
- ❌ Can't share code easily
- ❌ Maintain multiple copies of shared components
- ❌ Harder to keep in sync
- ❌ More repositories to manage

**Why monorepo over single app?**
- ✅ Clean domain separation
- ✅ Independent deployments
- ✅ Better routing structure
- ✅ Proper code sharing
- ✅ Better team scalability

---

### 5. "How can we achieve that it's both easy to handle and that we can route to different subdomains within Vercel?"

**Vercel Monorepo Setup:**

1. **Create three Vercel projects** pointing to the same GitHub repo:
   - `www-recurse-cc` → Root: `apps/www`
   - `docs-recurse-cc` → Root: `apps/docs`
   - `dashboard-recurse-cc` → Root: `apps/dashboard`

2. **Each project has its own:**
   - Build settings (pnpm workspace filters)
   - Environment variables
   - Custom domain (www.recurse.cc, docs.recurse.cc, dashboard.recurse.cc)

3. **Deployment:**
   - Each app deploys independently
   - Changes to `apps/docs/` only trigger docs deployment
   - Changes to `packages/ui/` trigger rebuilds of all apps

---

## Quick Reference

### Current Structure
```
docs.recurse.cc/
├── app/
│   ├── (home)/          → www.recurse.cc
│   ├── docs/            → docs.recurse.cc/docs
│   └── dashboard/       → docs.recurse.cc/dashboard
└── content/
    ├── docs/
    └── dashboard/
```

### New Structure
```
docs.recurse.cc/
├── apps/
│   ├── www/             → www.recurse.cc
│   ├── docs/            → docs.recurse.cc
│   └── dashboard/       → dashboard.recurse.cc
└── packages/
    ├── ui/              (shared)
    ├── auth/            (shared)
    └── api/             (shared)
```

---

## Implementation Steps

1. **Set up monorepo** (2-4 hours)
   - Create `pnpm-workspace.yaml`
   - Restructure directories
   - Split into apps and packages

2. **Migrate code** (4-8 hours)
   - Move code to appropriate apps
   - Create shared packages
   - Update imports

3. **Configure Vercel** (1-2 hours)
   - Create three Vercel projects
   - Set root directories
   - Configure domains

4. **Test & deploy** (2-4 hours)
   - Test locally
   - Deploy to Vercel
   - Verify DNS routing

**Total estimated time: 1-2 days**

---

## Next Steps

1. Review the documentation files I created:
   - `MONOREPO-SETUP.md` - Detailed setup guide
   - `ROUTING-OPTIONS.md` - Comparison of approaches
   - `IMPLEMENTATION-EXAMPLE.md` - Code examples

2. Decide on approach (recommend monorepo)

3. Let me know if you want me to:
   - Create the initial monorepo structure
   - Help migrate specific code sections
   - Set up Vercel configuration
   - Provide more examples

---

## Files Created

- ✅ `MONOREPO-SETUP.md` - Complete monorepo setup guide
- ✅ `ROUTING-OPTIONS.md` - Comparison of all routing options
- ✅ `IMPLEMENTATION-EXAMPLE.md` - Code examples for each app
- ✅ `SUMMARY.md` - This file (answers to your questions)

Would you like me to start implementing the monorepo structure now?

