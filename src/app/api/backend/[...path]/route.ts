import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 120;

function resolveBackendOrigin(): string {
  const url =
    process.env.BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    '';
  if (!url) return '';
  return url.replace(/\/$/, '');
}

async function proxyRequest(
  req: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  const origin = resolveBackendOrigin();
  if (!origin) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Backend API is not configured. Set BACKEND_API_URL on Vercel or use built-in AI generation.',
      },
      { status: 503 }
    );
  }

  const path = pathSegments.join('/');
  const search = req.nextUrl.search;
  const target = `${origin}/${path}${search}`;

  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const accept = req.headers.get('accept');
  if (accept) headers.set('accept', accept);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Backend request failed';
    return NextResponse.json(
      { success: false, message: `Cannot reach backend: ${message}` },
      { status: 502 }
    );
  }

  const body = await upstream.arrayBuffer();
  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) responseHeaders.set('content-type', upstreamType);

  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}
