import type { NextRequest } from 'next/server';

const ALLOWED_HOSTNAMES = new Set(['images.ctfassets.net', 'images.eu.ctfassets.net']);

const buildUpstreamUrl = (requestUrl: string, width?: string, quality?: string): URL | null => {
  try {
    // Handle both encoded and plain URLs to avoid client/server mismatch edge-cases.
    const decoded = decodeURIComponent(requestUrl);
    const parsed = new URL(decoded);

    if (parsed.protocol !== 'https:' || !ALLOWED_HOSTNAMES.has(parsed.hostname)) {
      return null;
    }

    if (width) parsed.searchParams.set('w', width);
    if (quality) parsed.searchParams.set('q', quality);

    return parsed;
  } catch {
    return null;
  }
};

const getProxyHeaders = (upstreamHeaders: Headers): Headers => {
  const responseHeaders = new Headers();
  const contentType = upstreamHeaders.get('content-type');
  const etag = upstreamHeaders.get('etag');

  if (contentType) responseHeaders.set('Content-Type', contentType);
  if (etag) responseHeaders.set('ETag', etag);

  responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return responseHeaders;
};

export async function HEAD(request: NextRequest): Promise<Response> {
  const requestUrl = request.nextUrl.searchParams.get('url');
  if (!requestUrl) return new Response(null, { status: 400 });

  const upstreamUrl = buildUpstreamUrl(requestUrl);
  if (!upstreamUrl) return new Response(null, { status: 400 });

  try {
    const upstreamResponse = await fetch(upstreamUrl, { method: 'HEAD', cache: 'force-cache' });
    return new Response(null, {
      status: upstreamResponse.ok ? 200 : upstreamResponse.status,
      headers: getProxyHeaders(upstreamResponse.headers),
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  const requestUrl = request.nextUrl.searchParams.get('url');
  const width = request.nextUrl.searchParams.get('w') ?? undefined;
  const quality = request.nextUrl.searchParams.get('q') ?? undefined;

  if (!requestUrl) return new Response('Missing url parameter', { status: 400 });

  const upstreamUrl = buildUpstreamUrl(requestUrl, width, quality);
  if (!upstreamUrl) return new Response('Unsupported image URL', { status: 400 });

  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
    cache: 'force-cache',
  });

  if (!upstreamResponse.ok) {
    return new Response('Upstream Error', { status: 502 });
  }

  return new Response(upstreamResponse.body, {
    status: 200,
    headers: getProxyHeaders(upstreamResponse.headers),
  });
}

