import { NextRequest } from 'next/server';

const ALLOWED_HOSTS = new Set(['images.ctfassets.net', 'images.eu.ctfassets.net']);
const DEFAULT_CACHE_CONTROL = 'public, max-age=31536000, immutable';

const buildUpstreamUrl = (requestUrl: string, width?: string, quality?: string): URL | null => {
  let upstreamUrl: URL;

  try {
    upstreamUrl = new URL(requestUrl);
  } catch {
    return null;
  }

  if (!ALLOWED_HOSTS.has(upstreamUrl.hostname)) {
    return null;
  }

  if (width) {
    upstreamUrl.searchParams.set('w', width);
  }

  if (quality) {
    upstreamUrl.searchParams.set('q', quality);
  }

  return upstreamUrl;
};

export async function GET(request: NextRequest): Promise<Response> {
  const requestUrl = request.nextUrl.searchParams.get('url');
  const width = request.nextUrl.searchParams.get('w') ?? undefined;
  const quality = request.nextUrl.searchParams.get('q') ?? undefined;

  if (!requestUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  const upstreamUrl = buildUpstreamUrl(requestUrl, width, quality);

  if (!upstreamUrl) {
    return new Response('Unsupported image URL', { status: 400 });
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      Accept: request.headers.get('accept') ?? 'image/*',
    },
    next: {
      revalidate: 31536000,
    },
  });

  if (!upstreamResponse.ok) {
    return new Response('Image fetch failed', { status: upstreamResponse.status });
  }

  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get('content-type');
  const cacheControl = upstreamResponse.headers.get('cache-control');
  const contentLength = upstreamResponse.headers.get('content-length');
  const etag = upstreamResponse.headers.get('etag');
  const lastModified = upstreamResponse.headers.get('last-modified');

  if (contentType) {
    responseHeaders.set('Content-Type', contentType);
  }

  if (contentLength) {
    responseHeaders.set('Content-Length', contentLength);
  }

  if (etag) {
    responseHeaders.set('ETag', etag);
  }

  if (lastModified) {
    responseHeaders.set('Last-Modified', lastModified);
  }

  responseHeaders.set('Cache-Control', cacheControl ?? DEFAULT_CACHE_CONTROL);
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');

  return new Response(upstreamResponse.body, {
    status: 200,
    headers: responseHeaders,
  });
}
