import { useTranslation } from '../../i18n';
import { ROUTE_PATH } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { ContactSection } from '../features/contact-section';
import { ContentContainer } from '../features/content-container';

export function ContactPage() {
  const { t } = useTranslation();
  useSeo({
    title: t('SEO.CONTACT.TITLE'),
    description: t('SEO.CONTACT.DESCRIPTION'),
    path: ROUTE_PATH.CONTACT,
    keywords: t('SEO.CONTACT.KEYWORDS'),
  });

  return (
    <ContentContainer>
      <div className="flex min-h-[calc(100dvh-10rem)]">
        <div className="w-full m-auto">
          <ContactSection />
        </div>
      </div>
    </ContentContainer>
  );
}
