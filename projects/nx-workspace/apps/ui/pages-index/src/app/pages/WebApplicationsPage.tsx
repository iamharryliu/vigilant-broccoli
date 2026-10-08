import {
  Bike,
  BookOpen,
  Bot,
  CloudSun,
  LayoutGrid,
  Link as LinkIcon,
  type LucideIcon,
  MapPin,
  PenTool,
  User,
  Users,
  Wrench,
} from 'lucide-react';
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
  Icon: LucideIcon;
};

const ICON_CLASS = 'h-5 w-5 shrink-0';

const APP_CARDS: readonly WebApplicationCard[] = [
  {
    href: 'https://context.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.CONTEXT_MD.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.CONTEXT_MD.DESCRIPTION',
    Icon: Bot,
  },
  {
    href: 'https://cloud8skate.com/',
    titleKey: 'WEB_APPLICATIONS_PAGE.CLOUD_8_SKATE.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.CLOUD_8_SKATE.DESCRIPTION',
    Icon: Bike,
  },
  {
    href: 'https://components.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.COMPONENT_LIBRARY.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.COMPONENT_LIBRARY.DESCRIPTION',
    Icon: LayoutGrid,
  },
  {
    href: 'https://docs.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.DOCS_MD.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.DOCS_MD.DESCRIPTION',
    Icon: BookOpen,
  },
  {
    href: 'https://findme.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.FIND_ME.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.FIND_ME.DESCRIPTION',
    Icon: MapPin,
  },
  {
    href: 'https://harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.HARRY_LIU.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.HARRY_LIU.DESCRIPTION',
    Icon: User,
  },
  {
    href: 'https://links.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.LINKS.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.LINKS.DESCRIPTION',
    Icon: LinkIcon,
  },
  {
    href: 'https://utilities.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.UTILITIES.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.UTILITIES.DESCRIPTION',
    Icon: Wrench,
  },
  {
    href: 'https://weather.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.WEATHER.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.WEATHER.DESCRIPTION',
    Icon: CloudSun,
  },
  {
    href: 'https://whiteboard.harryliu.dev/',
    titleKey: 'WEB_APPLICATIONS_PAGE.WHITEBOARD.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.WHITEBOARD.DESCRIPTION',
    Icon: PenTool,
  },
];

const DEMO_CARDS: readonly WebApplicationCard[] = [
  {
    href: 'https://demo-employee-handler-ui.vercel.app',
    titleKey: 'WEB_APPLICATIONS_PAGE.EMPLOYEE_HANDLER.TITLE',
    descriptionKey: 'WEB_APPLICATIONS_PAGE.EMPLOYEE_HANDLER.DESCRIPTION',
    Icon: Users,
  },
];

export function WebApplicationsPage() {
  const { t } = useTranslation();

  const renderSortedCards = (cards: readonly WebApplicationCard[]) =>
    cards
      .map(({ href, titleKey, descriptionKey, Icon }) => ({
        href,
        title: t(titleKey),
        description: t(descriptionKey),
        icon: <Icon className={ICON_CLASS} aria-hidden="true" />,
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
