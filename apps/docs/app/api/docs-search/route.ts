import { createFromSource } from "fumadocs-core/search/server";
import { NextRequest, NextResponse } from "next/server";
import { source } from "@/lib/source";

export async function GET(request: NextRequest) {
  const { GET: fumadocsGet } = createFromSource(source, {
    language: "english",
  });

  // Get the origin from the request
  const origin = request.headers.get("origin");
  
  // Determine allowed origins
  const allowedOrigins = [
    // Production www origin
    "https://www.recurse.cc",
    // Dev www origin
    "http://localhost:3002",
    // Dev dashboard origin (in case they want to search from dashboard too)
    "http://localhost:3001",
  ];

  // Check if origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  // Get the Fumadocs response (returns a Response object)
  const fumadocsResponse = await fumadocsGet(request);

  // Clone the response body
  const body = fumadocsResponse.body;

  // Create NextResponse with the body and status
  const response = new NextResponse(body, {
    status: fumadocsResponse.status,
    statusText: fumadocsResponse.statusText,
  });

  // Copy existing headers from fumadocs response
  fumadocsResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  // Add CORS headers
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  const allowedOrigins = [
    "https://www.recurse.cc",
    "http://localhost:3002",
    "http://localhost:3001",
  ];

  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  const response = new NextResponse(null, {
    status: 204,
  });

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}
