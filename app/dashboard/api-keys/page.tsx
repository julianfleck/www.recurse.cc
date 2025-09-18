import { ApiKeysTable } from "@/components/api-keys/api-keys-table";

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">API Keys</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your API keys for programmatic access to the platform.
        </p>
      </div>

      <ApiKeysTable />
    </div>
  );
}
