const DEFAULT_BASE_URL = 'http://localhost:3001';

export function getBaseUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL);
}

export function hasContentfulConfig(): boolean {
  return Boolean(
    process.env.CONTENTFUL_SPACE_ID &&
      process.env.CONTENTFUL_ACCESS_TOKEN &&
      process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
  );
}

export function isContentfulConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = 'cause' in error ? error.cause : undefined;

  if (!(cause instanceof Error)) {
    return false;
  }

  return [
    'SELF_SIGNED_CERT_IN_CHAIN',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'ECONNREFUSED',
    'ECONNRESET',
    'ENOTFOUND',
  ].includes((cause as NodeJS.ErrnoException).code ?? '');
}

export function isContentfulConfigurationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const response = 'response' in error ? error.response : undefined;
  const status =
    response && typeof response === 'object' && 'status' in response ? response.status : undefined;

  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return true;
  }

  const message = error instanceof Error ? error.message : '';

  return (
    message.includes('GraphQL Error (Code: 400)') ||
    message.includes('GraphQL Error (Code: 404)') ||
    message.includes('GraphQL Error (Code: 401)') ||
    message.includes('GraphQL Error (Code: 403)') ||
    message.includes('The resource could not be found') ||
    message.includes('Cannot query field') ||
    message.includes('Unknown type')
  );
}

export function isContentfulUnavailableError(error: unknown): boolean {
  return isContentfulConnectionError(error) || isContentfulConfigurationError(error);
}

export function getContentfulFallbackMessage(): string {
  if (!hasContentfulConfig()) {
    return 'Contentful is not configured. Fill in CONTENTFUL_SPACE_ID and access tokens in .env.';
  }

  return 'Contentful space schema does not match this starter template or the configuration is invalid. Check CONTENTFUL_SPACE_ID, CONTENTFUL_SPACE_ENVIRONMENT, tokens, and required content types.';
}
