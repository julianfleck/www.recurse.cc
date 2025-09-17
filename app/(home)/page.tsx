import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">Welcome to Recurse.cc</h1>
      <p className="mb-8 text-fd-muted-foreground">
        Turn your documents into living context for AI systems
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/docs"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          📚 Documentation
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
        >
          🧠 Dashboard
        </Link>
      </div>
    </main>
  );
}
