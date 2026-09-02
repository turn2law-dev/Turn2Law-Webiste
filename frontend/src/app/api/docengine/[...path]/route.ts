import { NextRequest, NextResponse } from "next/server";

// Strip any trailing slash or /api suffix so we can always prepend /api/ cleanly.
const ENGINE_BASE = (
  process.env.DOCUMENT_GENERATION_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "").replace(/\/api$/, "");

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  // Always route through /api/ on the backend regardless of how the env var is set.
  const upstreamUrl = `${ENGINE_BASE}/api/${path.join("/")}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("origin");

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Document engine proxy failed", error);
    return NextResponse.json(
      { error: "Document engine is unavailable. Start the API on port 8000." },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
