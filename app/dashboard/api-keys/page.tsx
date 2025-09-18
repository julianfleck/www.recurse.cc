import { ApiKeysTable } from "@/components/api-keys/api-keys-table";

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys for programmatic access to the platform.
        </p>
      </div>

      <ApiKeysTable />
    </div>
  );
}
