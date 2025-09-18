import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 font-bold text-2xl">Welcome to Recurse.cc</h1>
      <p className="mb-8 text-fd-muted-foreground">
        Turn your documents into living context for AI systems
      </p>
      <div className="flex justify-center gap-4">
        <Link
          className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          href="/docs"
        >
          📚 Documentation
        </Link>
        <Link
          className="rounded-lg bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/90"
          href="/dashboard"
        >
          🧠 Dashboard
        </Link>
      </div>
    </main>
  );
}
