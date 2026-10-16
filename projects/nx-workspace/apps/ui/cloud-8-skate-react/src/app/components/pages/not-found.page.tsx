import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { ROUTE_PATH } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { ContentContainer } from '../features/content-container';

export function NotFoundPage() {
  const { t } = useTranslation();
  useSeo({
    title: t('SEO.NOT_FOUND.TITLE'),
    description: t('SEO.NOT_FOUND.DESCRIPTION'),
    keywords: '',
  });

  return (
    <ContentContainer>
      <section className="mb-8 text-center reveal-up">
        <h1 className="text-6xl font-bold mb-4 reveal-up">
          {t('NOT_FOUND.CODE')}
        </h1>
        <p className="text-xl text-gray-700 mb-8 reveal-up reveal-up-delay-1">
          {t('NOT_FOUND.MESSAGE')}
        </p>
        <Link
          to={ROUTE_PATH.HOME}
          className="inline-flex items-center rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 interactive-chip reveal-up reveal-up-delay-2"
        >
          {t('NOT_FOUND.GO_HOME')}
        </Link>
      </section>
    </ContentContainer>
  );
}
