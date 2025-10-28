# recurse.cc Monorepo

Monorepo for the Recurse.cc platform, featuring a marketing website, documentation site, and dashboard application.

## Project Structure

```
recurse.cc/
├── apps/
│   ├── www/              # Marketing website (www.recurse.cc)
│   ├── docs/             # Documentation site (docs.recurse.cc)
│   └── dashboard/        # Dashboard application (dashboard.recurse.cc)
├── packages/
│   ├── ui/               # Shared UI components
│   ├── auth/             # Authentication logic
│   ├── api/              # API client
│   ├── fumadocs/         # Fumadocs shared configuration
│   └── config/           # Shared configurations
├── docs/
│   ├── research/         # Research logs and findings
│   ├── context/           # Context maps and understanding
│   ├── tasks/            # Task workflow (planned, active, completed)
│   └── planning/         # Project documentation
├── .cursor/rules/        # Cursor rules for AI assistance
├── overview.yaml         # Project ledger (single source of truth)
└── CHANGELOG.md          # Auditable trail of changes
```

## Apps

### apps/www
Marketing website deployed to `www.recurse.cc`
- Landing page with value proposition
- Product pages
- Pricing information
- Blog (using Fumadocs)

### apps/docs
Documentation site deployed to `docs.recurse.cc`
- RAGE technology documentation
- API reference
- Getting started guides
- Platform documentation

**Note:** This is currently the primary app with all existing functionality from the original docs.recurse.cc repository.

### apps/dashboard
Dashboard application deployed to `dashboard.recurse.cc`
- User management
- Document management
- Graph visualization
- Settings and configuration

## Packages

### @recurse/ui
Shared UI components built on Radix UI
- Button, Card, Dialog, etc.
- Theme support
- Accessible components

### @recurse/auth
Authentication components and logic
- NextAuth integration
- Auth forms (login, signup, forgot password)
- Auth store (Zustand)
- Protected route utilities

### @recurse/api
API client and type definitions
- REST API client
- Type-safe request/response handling
- Error handling utilities

### @recurse/fumadocs
Shared Fumadocs configuration
- Icon resolver
- Syntax highlighting themes
- MDX transformers
- Shared utilities

### @recurse/config
Shared configurations
- TypeScript base config
- Tailwind CSS config
- Biome/Ultracite linting config

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Documentation**: Fumadocs
- **Styling**: Tailwind CSS 4
- **Linting**: Ultracite (Biome)
- **Package Manager**: pnpm with workspaces
- **TypeScript**: 5.x with strict mode

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev:all

# Run specific app
pnpm dev:www     # apps/www
pnpm dev:docs    # apps/docs
pnpm dev:dashboard # apps/dashboard
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
cd apps/www && pnpm build
```

## Cursor Rules

This project uses comprehensive cursor rules to guide AI assistance:

- **general.mdc**: Recursive Bootstrapping Protocol
- **typescript.mdc**: TypeScript conventions
- **next.mdc**: Next.js 15 patterns
- **routing.mdc**: App Router patterns
- **fumadocs.mdc**: Fumadocs framework
- **ultracite.mdc**: Linting and formatting
- **monorepo.mdc**: Monorepo patterns

See `.cursor/rules/` for complete documentation.

## Documentation

### Research Logs
External and internal research documented in `docs/research/YYYY-MM-DD/`

### Context Maps
Progressive understanding captured in `docs/context/`

### Task Tracking
Workflow management in `docs/tasks/` (planned, active, completed)

### Project Ledger
Complete inventory in `overview.yaml`

### Changelog
Auditable trail in `CHANGELOG.md`

## Deployment

Each app is deployed separately on Vercel:

- `www.recurse.cc` → `apps/www`
- `docs.recurse.cc` → `apps/docs`
- `dashboard.recurse.cc` → `apps/dashboard`

## Contributing

1. Follow the Recursive Bootstrapping Protocol (see `.cursor/rules/general.mdc`)
2. Research before implementing (document in `docs/research/`)
3. Update context maps as understanding evolves
4. Log all changes in `CHANGELOG.md`
5. Keep `overview.yaml` up to date

## License

Private repository - All rights reserved
