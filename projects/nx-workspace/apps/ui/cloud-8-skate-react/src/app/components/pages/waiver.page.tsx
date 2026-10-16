import { useTranslation } from '../../i18n';
import { EXTERNAL_URL, ROUTE_PATH } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { ContentContainer } from '../features/content-container';

export function WaiverPage() {
  const { t } = useTranslation();
  useSeo({
    title: t('SEO.WAIVER.TITLE'),
    description: t('SEO.WAIVER.DESCRIPTION'),
    path: ROUTE_PATH.WAIVER,
    keywords: t('SEO.WAIVER.KEYWORDS'),
  });

  return (
    <ContentContainer>
      <section className="mb-8 reveal-up">
        <h1 className="text-3xl font-bold mb-4 lg:text-4xl reveal-up reveal-up-delay-1">
          {t('WAIVER.TITLE')}
        </h1>
        <p className="text-base leading-7 text-gray-700 mb-8 reveal-up reveal-up-delay-2">
          {t('WAIVER.DESCRIPTION')}
        </p>
        <div className="text-center reveal-up">
          <a
            href={EXTERNAL_URL.WAIVER_DOC}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-blue-500 px-8 py-3 text-lg font-medium text-white transition hover:bg-blue-700 interactive-chip"
          >
            {t('WAIVER.VIEW')}
          </a>
        </div>
      </section>
    </ContentContainer>
  );
}
