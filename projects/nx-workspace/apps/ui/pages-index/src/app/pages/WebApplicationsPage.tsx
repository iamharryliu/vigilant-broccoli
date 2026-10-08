import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { SectionHeading } from '../components/SectionHeading';
import { CardLink } from '../components/CardLink';
import { CardGrid } from '../components/CardGrid';
import { PAGE_CLASS } from '../consts/layout';

type WebApplicationCard = {
  href: string;
  titleKey: string;
  descriptionKey: string;
};

const APP_CARDS: readonly WebApplicationCard[] = [
  {
    href: 'https://context.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.CONTEXT_MD.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.CONTEXT_MD.DESCRIPTION',
  },
  {
    href: 'https://cloud8skate.com/',
    titleKey: 'WEB_APPLICATIONS_PAGE.CLOUD_8_SKATE.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.CLOUD_8_SKATE.DESCRIPTION',
  },
  {
    href: 'https://components.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.COMPONENT_LIBRARY.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.COMPONENT_LIBRARY.DESCRIPTION',
  },
  {
    href: 'https://docs.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.DOCS_MD.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.DOCS_MD.DESCRIPTION',
  },
  {
    href: 'https://findme.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.FIND_ME.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.FIND_ME.DESCRIPTION',
  },
  {
    href: 'https://harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.HARRY_LIU.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.HARRY_LIU.DESCRIPTION',
  },
  {
    href: 'https://links.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.LINKS.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.LINKS.DESCRIPTION',
  },
  {
    href: 'https://utilities.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.UTILITIES.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.UTILITIES.DESCRIPTION',
  },
  {
    href: 'https://weather.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.WEATHER.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.WEATHER.DESCRIPTION',
  },
  {
    href: 'https://whiteboard.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.WHITEBOARD.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.WHITEBOARD.DESCRIPTION',
  },
];

const DEMO_CARDS: readonly WebApplicationCard[] = [
  {
    href: 'https://demo-employee-handler-ui.vercel.app',
    titleKey: 'WEB_APPLICATIONS_PAGE.EMPLOYEE_HANDLER.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.EMPLOYEE_HANDLER.DESCRIPTION',
  },
];

export function WebApplicationsPage() {
  const { t } = useTranslation();

  const renderSortedCards = (cards: readonly WebApplicationCard[]) =>
    cards
      .map(({ href, titleKey, descriptionKey }) => ({
        href,
        title: t(titleKey),
        description: t(descriptionKey),
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(card => (
        <li key={card.href}>
          <CardLink {...card} />
        </li>
      ));

  return (
    <main className={PAGE_CLASS}>
      <PageHeader title={t('WEB_APPLICATIONS_PAGE.TITLE')} />

      <section className="mb-12">
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_APPS')}
        </SectionHeading>
        <CardGrid>{renderSortedCards(APP_CARDS)}</CardGrid>
      </section>

      <section>
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_DEMO')}
        </SectionHeading>
        <CardGrid>{renderSortedCards(DEMO_CARDS)}</CardGrid>
      </section>
    </main>
  );
}
