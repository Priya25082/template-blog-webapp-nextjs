import type { NextRequest } from 'next/server';
import { i18nRouter } from 'next-i18n-router';

import i18nConfig from '@src/i18n/config';

export function middleware(request: NextRequest) {
  const response = i18nRouter(request, i18nConfig);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: '/((?!api|contentful-image|static|.*\\..*|_next).*)',
};
