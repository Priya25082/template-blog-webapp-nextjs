import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { twMerge } from 'tailwind-merge';

import { ImageFieldsFragment } from '@src/lib/__generated/sdk';

interface ImageProps extends Omit<ImageFieldsFragment, '__typename'> {
  nextImageProps?: Omit<NextImageProps, 'src' | 'alt'>;
}

const BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

const unwrapOptimizedImageUrl = (inputUrl: string): string => {
  const trimmed = inputUrl.trim();

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.includes('/_next/image') || trimmed.includes('/contentful-image')) {
    try {
      const parsed = new URL(trimmed, 'http://localhost');
      const inner = parsed.searchParams.get('url');
      if (inner) return inner;
    } catch {
      // ignore and fall back to original
    }
  }

  return trimmed;
};

export const CtfImage = ({ url, width, height, title, nextImageProps }: ImageProps) => {
  if (!url || !width || !height) return null;

  const normalizedUrl = unwrapOptimizedImageUrl(url);
  const proxyLoader: NextImageProps['loader'] = ({ src, width, quality }) => {
    const q = quality ?? 75;
    return `/contentful-image?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
  };

  return (
    <NextImage
      src={normalizedUrl}
      width={width}
      height={height}
      alt={title || ''}
      sizes="(max-width: 1200px) 100vw, 50vw"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      loader={proxyLoader}
      {...nextImageProps}
      className={twMerge(nextImageProps?.className, 'transition-all')}
    />
  );
};
