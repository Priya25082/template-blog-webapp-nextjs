'use client';

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from '@contentful/live-preview/react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import { ArticleAuthor } from '@src/components/features/article/ArticleAuthor';
import { ArticleLabel } from '@src/components/features/article/ArticleLabel';
import { CtfImage } from '@src/components/features/contentful';
import { FormatDate } from '@src/components/shared/format-date';
import { PageBlogPostFieldsFragment } from '@src/lib/__generated/sdk';

interface ArticleHeroProps {
  article: PageBlogPostFieldsFragment;
  isFeatured?: boolean;
  isReversedLayout?: boolean;
  locale?: string;
}

export const ArticleHero = ({
  article,
  isFeatured,
  isReversedLayout = false,
}: ArticleHeroProps) => {
  const { t } = useTranslation();
  const inspectorProps = useContentfulInspectorMode({ entryId: article.sys.id });
  const { title, shortDescription, publishedDate } = useContentfulLiveUpdates(article);

  return (
    <div
      className={twMerge(
        'grid overflow-hidden rounded-[28px] border border-gray300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]',
        isReversedLayout
          ? 'lg:grid-cols-[minmax(26rem,0.92fr)_minmax(0,1.08fr)]'
          : 'lg:grid-cols-[minmax(0,1.08fr)_minmax(26rem,0.92fr)]',
      )}
    >
      <div
        className="min-h-[320px] overflow-hidden bg-gray200 lg:min-h-full"
        {...inspectorProps({ fieldId: 'featuredImage' })}
      >
        {article.featuredImage && (
          <CtfImage
            nextImageProps={{
              className: 'h-full w-full object-cover aspect-[4/3] lg:aspect-auto',
              priority: true,
              sizes: undefined,
            }}
            {...article.featuredImage}
          />
        )}
      </div>

      <div className="relative flex min-h-full flex-col justify-between gap-10 bg-gradient-to-br from-white via-white to-gray100 px-6 py-8 lg:px-12 lg:py-12 xl:px-16">
        <div className="flex flex-wrap items-center gap-3">
          <ArticleAuthor article={article} />
          {isFeatured && (
            <ArticleLabel
              className={twMerge(
                'lg:absolute lg:top-8 xl:top-10',
                isReversedLayout ? 'lg:left-6 xl:left-8' : 'lg:right-6 xl:right-8',
              )}
            >
              {t('article.featured')}
            </ArticleLabel>
          )}
          <div
            className={twMerge(
              'text-xs text-gray600 lg:ml-auto',
              isReversedLayout ? 'lg:block' : '',
            )}
            {...inspectorProps({ fieldId: 'publishedDate' })}
          >
            <FormatDate date={publishedDate} />
          </div>
        </div>

        <div className="max-w-xl">
          <h1
            className="text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-gray900 lg:text-[3.25rem]"
            {...inspectorProps({ fieldId: 'title' })}
          >
            {title}
          </h1>
          {shortDescription && (
            <p
              className="mt-4 max-w-2xl text-base leading-7 text-gray600"
              {...inspectorProps({ fieldId: 'shortDescription' })}
            >
              {shortDescription}
            </p>
          )}
          <div
            className={twMerge('mt-6 text-xs text-gray600 lg:hidden', isReversedLayout ? '' : '')}
            {...inspectorProps({ fieldId: 'publishedDate' })}
          >
            <FormatDate date={publishedDate} />
          </div>
        </div>
      </div>
    </div>
  );
};
