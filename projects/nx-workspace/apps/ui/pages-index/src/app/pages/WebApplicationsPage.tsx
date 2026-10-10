import {
  Bike,
  BookOpen,
  Bot,
  CalendarDays,
  CloudSun,
  Gamepad2,
  Globe,
  Hourglass,
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
import WEB_APPLICATIONS from '../consts/webApplications.json';

type WebApplicationEntry = {
  id: string;
  href: string;
  titleKey: string;
  descriptionKey: string;
};

type TranslationKey = Parameters<ReturnType<typeof useTranslation>['t']>[0];

const ICON_CLASS = 'h-5 w-5 shrink-0';

const FALLBACK_ICON: LucideIcon = Globe;

const CARD_ICONS: Partial<Record<string, LucideIcon>> = {
  balloono: Gamepad2,
  calendars: CalendarDays,
  'context-md': Bot,
  'cloud-8-skate': Bike,
  'component-library': LayoutGrid,
  'docs-md': BookOpen,
  'find-me': MapPin,
  'harry-liu': User,
  links: LinkIcon,
  utilities: Wrench,
  'waiting-games': Hourglass,
  weather: CloudSun,
  whiteboard: PenTool,
  'employee-handler': Users,
};

export function WebApplicationsPage() {
  const { t } = useTranslation();

  const renderSortedCards = (entries: readonly WebApplicationEntry[]) =>
    entries
      .map(({ id, href, titleKey, descriptionKey }) => {
        const Icon = CARD_ICONS[id] ?? FALLBACK_ICON;
        return {
          href,
          title: t(titleKey as TranslationKey),
          description: t(descriptionKey as TranslationKey),
          icon: <Icon className={ICON_CLASS} aria-hidden="true" />,
        };
      })
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
        <CardGrid>{renderSortedCards(WEB_APPLICATIONS.applications)}</CardGrid>
      </section>

      <section>
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_DEMO')}
        </SectionHeading>
        <CardGrid>{renderSortedCards(WEB_APPLICATIONS.demos)}</CardGrid>
      </section>
    </main>
  );
}
