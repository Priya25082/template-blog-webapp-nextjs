import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { twMerge } from 'tailwind-merge';

import { ImageFieldsFragment } from '@src/lib/__generated/sdk';

interface ImageProps extends Omit<ImageFieldsFragment, '__typename'> {
  nextImageProps?: Omit<NextImageProps, 'src' | 'alt'>;
}

const BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';

const contentfulImageLoader: NextImageProps['loader'] = ({ src, width, quality }) => {
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
  });

  if (quality) {
    params.set('q', quality.toString());
  }

  return `/contentful-image?${params.toString()}`;
};

export const CtfImage = ({ url, width, height, title, nextImageProps }: ImageProps) => {
  if (!url || !width || !height) return null;

  return (
    <NextImage
      src={url}
      width={width}
      height={height}
      alt={title || ''}
      loader={contentfulImageLoader}
      sizes="(max-width: 1200px) 100vw, 50vw"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      {...nextImageProps}
      className={twMerge(nextImageProps?.className, 'transition-all')}
    />
  );
};
