import type { NextRequest } from 'next/server';

const ALLOWED_HOSTNAMES = new Set(['images.ctfassets.net', 'images.eu.ctfassets.net']);

const isAllowedImageUrl = (input: string): boolean => {
  try {
    const parsed = new URL(input);
    return parsed.protocol === 'https:' && ALLOWED_HOSTNAMES.has(parsed.hostname);
  } catch {
    return false;
  }
};

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url || !isAllowedImageUrl(url)) {
    return new Response('Bad Request', { status: 400 });
  }

  const upstreamResponse = await fetch(url, {
    // Ensure we don't forward potentially sensitive headers.
    headers: {
      accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
    // Cache on Vercel edge/CDN similarly to typical image assets.
    cache: 'force-cache',
  });

  if (!upstreamResponse.ok) {
    return new Response('Upstream Error', { status: 502 });
  }

  const headers = new Headers(upstreamResponse.headers);

  // Security headers (what scanners typically require)
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Keep caching aggressive; images are content-addressed on Contentful CDN.
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(upstreamResponse.body, {
    status: 200,
    headers,
  });
}

