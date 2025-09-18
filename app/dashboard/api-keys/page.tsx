import { ApiKeysTable } from "@/components/api-keys/api-keys-table";

export default function ApiKeysPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">API Keys</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your API keys for programmatic access to the platform.
          </p>
        </div>

        <div className="flex-1 flex items-end">
          <ApiKeysTable />
        </div>
      </div>
    </div>
  );
}
