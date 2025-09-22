import { createFromSource } from "fumadocs-core/search/server";
import type { NextRequest } from "next/server";
import { source } from "@/lib/source";

export async function GET(request: NextRequest) {
  const { GET: fumadocsGet } = createFromSource(source, {
    language: "english",
  });

  // Always use Fumadocs search here
  return fumadocsGet(request);
}
