import { useTranslation } from '../../i18n';
import { ROUTE_PATH } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { CalendarSection } from '../features/calendar-section';
import { ContentContainer } from '../features/content-container';

export function CalendarPage() {
  const { t } = useTranslation();
  useSeo({
    title: t('SEO.CALENDAR.TITLE'),
    description: t('SEO.CALENDAR.DESCRIPTION'),
    path: ROUTE_PATH.CALENDAR,
    keywords: t('SEO.CALENDAR.KEYWORDS'),
  });

  return (
    <ContentContainer>
      <CalendarSection />
    </ContentContainer>
  );
}
