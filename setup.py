#!/usr/bin/env python3

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


def run(cmd: str, cwd: Path) -> None:
    process = subprocess.run(cmd, shell=True, cwd=str(cwd))
    if process.returncode != 0:
        raise RuntimeError(f"Command failed: {cmd}")


def write_file(path: Path, content: str, *, overwrite: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and not overwrite:
        return
    path.write_text(content, encoding="utf-8")


def ensure_gitignore(project_dir: Path) -> None:
    gitignore_path = project_dir / ".gitignore"
    gitignore_content = """
node_modules
.next
out
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
""".strip()
    write_file(gitignore_path, gitignore_content)


def create_package_json(project_dir: Path) -> None:
    package_json_path = project_dir / "package.json"
    if package_json_path.exists():
        # Merge minimal fields if exists
        try:
            data = json.loads(package_json_path.read_text(encoding="utf-8"))
        except Exception:
            data = {}
    else:
        data = {}

    data.setdefault("name", project_dir.name)
    data.setdefault("private", True)
    data.setdefault("version", "0.1.0")
    data.setdefault("type", "module")
    scripts = data.setdefault("scripts", {})
    scripts.setdefault("dev", "next dev")
    # With output: 'export', next build will export to 'out' automatically
    scripts.setdefault("build", "next build")
    scripts.setdefault("start", "next start")
    scripts.setdefault("lint", "eslint .")
    scripts.setdefault("typecheck", "tsc --noEmit")

    package_json_path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def create_next_config(project_dir: Path) -> None:
    next_config_path = project_dir / "next.config.mjs"
    next_config_content = """
// Next.js configuration with static export and MDX (Fumadocs)
// See: https://fumadocs.dev/docs/ui/static-export
// MDX integration for Next.js:
// https://fumadocs.dev/docs/mdx/next
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  experimental: {
    typedRoutes: true,
  },
};

export default withMDX(nextConfig);
""".strip() + "\n"
    write_file(next_config_path, next_config_content, overwrite=True)


def create_tsconfig(project_dir: Path) -> None:
    tsconfig_path = project_dir / "tsconfig.json"
    tsconfig = {
        "compilerOptions": {
            "target": "ES2021",
            "lib": ["ES2021", "DOM", "DOM.Iterable"],
            "allowJs": False,
            "skipLibCheck": True,
            "strict": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "ESNext",
            "moduleResolution": "Bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "types": ["node"],
            "paths": {},
            "baseUrl": ".",
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.mdx"],
        "exclude": ["node_modules"],
    }
    tsconfig_path.write_text(json.dumps(tsconfig, indent=2) + "\n", encoding="utf-8")


def create_app_files(project_dir: Path) -> None:
    app_dir = project_dir / "app"
    globals_css = """
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
""".strip() + "\n"
    write_file(app_dir / "globals.css", globals_css)

    layout_tsx = """
import React from 'react';
import './globals.css';
import { RootProvider } from 'fumadocs-ui/provider';

export const metadata = {
  title: 'Fumadocs Starter',
  description: 'Next.js + Fumadocs static export starter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
""".strip() + "\n"
    write_file(app_dir / "layout.tsx", layout_tsx)

    page_tsx = """
import Link from 'next/link';

export default function Page() {
  return (
    <main>
      <h1>Next.js + Fumadocs</h1>
      <p>This starter installs Fumadocs packages and enables static export.</p>
      <p>Open <code>/docs</code> to view an example MDX page.</p>
      <p>
        <Link href="/docs">Go to Docs</Link>
      </p>
    </main>
  );
}
""".strip() + "\n"
    write_file(app_dir / "page.tsx", page_tsx)

    # Do not create /app/docs/page.mdx; we will use content/docs + UI routes


def create_fumadocs_source_config(project_dir: Path) -> None:
    config_ts = (
        "import { defineConfig, defineDocs } from 'fumadocs-mdx/config';\n\n"
        "export const docs = defineDocs({\n"
        "  dir: 'content/docs',\n"
        "});\n\n"
        "export default defineConfig();\n"
    )
    write_file(project_dir / "source.config.ts", config_ts, overwrite=True)
    # Minimal content folder with one doc
    intro_mdx = (
        "---\n"
        "title: \"Introduction\"\n"
        "description: \"Welcome to your Fumadocs site\"\n"
        "---\n\n"
        "# Introduction\n\n"
        "This is a minimal document rendered by Fumadocs.\n"
    )
    write_file(project_dir / "content" / "docs" / "intro.mdx", intro_mdx, overwrite=False)


def create_fumadocs_ui_files(project_dir: Path) -> None:
    mdx_components = (
        "import defaultMdxComponents from 'fumadocs-ui/mdx';\n"
        "import type { MDXComponents } from 'mdx/types';\n\n"
        "export function getMDXComponents(components?: MDXComponents): MDXComponents {\n"
        "  return {\n"
        "    ...defaultMdxComponents,\n"
        "    ...components,\n"
        "  };\n"
        "}\n"
    )
    write_file(project_dir / "mdx-components.tsx", mdx_components, overwrite=True)

    layout_shared = (
        "import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';\n\n"
        "export function baseOptions(): BaseLayoutProps {\n"
        "  return {\n"
        "    nav: { title: 'My Docs' },\n"
        "  };\n"
        "}\n"
    )
    write_file(project_dir / "lib" / "layout.shared.tsx", layout_shared, overwrite=True)

    lib_source = (
        "import { createMDXSource } from 'fumadocs-mdx';\n"
        "import { docs } from '../source.config';\n\n"
        "export const source = createMDXSource(docs);\n"
    )
    write_file(project_dir / "lib" / "source.ts", lib_source, overwrite=True)

    docs_layout = (
        "import { DocsLayout } from 'fumadocs-ui/layouts/docs';\n"
        "import { source } from 'lib/source';\n"
        "import { baseOptions } from 'lib/layout.shared';\n\n"
        "export default function Layout({ children }: { children: React.ReactNode }) {\n"
        "  return (\n"
        "    <DocsLayout tree={source.pageTree} {...baseOptions()}>\n"
        "      {children}\n"
        "    </DocsLayout>\n"
        "  );\n"
        "}\n"
    )
    write_file(project_dir / "app" / "docs" / "layout.tsx", docs_layout, overwrite=True)

    docs_page = (
        "import { notFound } from 'next/navigation';\n"
        "import { source } from 'lib/source';\n"
        "import { DocsPage } from 'fumadocs-ui/page';\n"
        "import { getMDXComponents } from 'mdx-components';\n\n"
        "export default function Page({ params }: { params: { slug?: string[] } }) {\n"
        "  const page = source.getPage(params.slug);\n"
        "  if (!page) notFound();\n"
        "  return <DocsPage page={page} components={getMDXComponents()} />;\n"
        "}\n\n"
        "export function generateStaticParams() {\n"
        "  return source.generateParams('/docs');\n"
        "}\n"
    )
    write_file(project_dir / "app" / "docs" / "[[...slug]]" / "page.tsx", docs_page, overwrite=True)


def install_dependencies(project_dir: Path) -> None:
    # Core runtime deps
    run("npm install --silent next react react-dom fumadocs-ui fumadocs-core fumadocs-mdx", cwd=project_dir)
    # Dev deps
    run(
        "npm install -D --silent typescript @types/node @types/react @types/react-dom @types/mdx tailwindcss eslint @next/eslint-plugin-next",
        cwd=project_dir,
    )


def main() -> None:
    if len(sys.argv) > 1:
        project_dir = Path(sys.argv[1]).resolve()
    else:
        project_dir = Path.cwd().resolve()

    project_dir.mkdir(parents=True, exist_ok=True)

    # Use official CLI to scaffold the app; keep prompts interactive.
    before = set(os.listdir(project_dir))
    print("\nRunning: npm create fumadocs-app@latest (answer the prompts; you can use '.' for current dir)\n")
    run("npm create fumadocs-app@latest", cwd=project_dir)

    after = set(os.listdir(project_dir))
    created = list(after - before)

    # If a subdirectory was created, move it into the current dir
    if len(created) == 1:
        created_path = project_dir / created[0]
        if created_path.is_dir():
            for item in created_path.iterdir():
                target = project_dir / item.name
                if item.is_dir():
                    shutil.copytree(item, target, dirs_exist_ok=True)
                else:
                    shutil.copy2(item, target)
            shutil.rmtree(created_path)

    print("\n✅ Fumadocs app is ready.")
    print("\nNext steps:")
    print("  npm run dev   # Start dev server")
    print("  npm run build # Build (static export, outputs to out/)")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"\n[setup.py] Error: {exc}")
        sys.exit(1)



