import { ApiKeysTable } from "@/components/api-keys/api-keys-table";

export default function ApiKeysPage() {
  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "calc(100vh - var(--fd-nav-height))" }}
    >
      <div className="container mx-auto flex flex-1 flex-col p-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">API Keys</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your API keys for programmatic access to the platform.
          </p>
        </div>

        <div className="flex flex-1 items-end">
          <ApiKeysTable />
        </div>
      </div>
    </div>
  );
}