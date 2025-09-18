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

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Security Notice
            </h3>
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              <p>
                Do not share your API key with others or expose it in the browser or other client-side code. To protect your account's security, we may automatically disable any API key that has leaked publicly.
                <a href="/dashboard/usage" className="ml-1 underline hover:no-underline">
                  View usage per API key on the Usage page.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ApiKeysTable />
    </div>
  );
}
