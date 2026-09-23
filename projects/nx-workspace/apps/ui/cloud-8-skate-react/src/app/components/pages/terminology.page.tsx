import { useTranslation } from '../../i18n';
import { ROUTE_PATH, SITE_CONTENT } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { MarkdownPage } from '../global/markdown-page';
import { ContentContainer } from '../features/content-container';

export function TerminologyPage() {
  const { t } = useTranslation();
  useSeo({
    title: t('SEO.TERMINOLOGY.TITLE'),
    description: t('SEO.TERMINOLOGY.DESCRIPTION'),
    path: ROUTE_PATH.TERMINOLOGY,
    keywords: t('SEO.TERMINOLOGY.KEYWORDS'),
  });

  return (
    <ContentContainer>
      <MarkdownPage filepath={SITE_CONTENT.TERMINOLOGY} />
    </ContentContainer>
  );
}
