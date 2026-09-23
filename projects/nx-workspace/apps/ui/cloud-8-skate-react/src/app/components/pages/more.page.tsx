import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { ROUTE_PATH, SITE_CONTENT } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { MarkdownPage } from '../global/markdown-page';
import { ContentContainer } from '../features/content-container';

export function MorePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  useSeo({
    title: t('SEO.MORE.TITLE'),
    description: t('SEO.MORE.DESCRIPTION'),
    path: ROUTE_PATH.MORE,
    keywords: t('SEO.MORE.KEYWORDS'),
  });

  return (
    <ContentContainer>
      <MarkdownPage
        filepath={id ? SITE_CONTENT.subpage(id) : SITE_CONTENT.MORE}
      />
    </ContentContainer>
  );
}
