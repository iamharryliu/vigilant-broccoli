import {
  Bike,
  BookOpen,
  Bookmark,
  Bot,
  Briefcase,
  CalendarDays,
  CheckSquare,
  CloudSun,
  Code,
  Gamepad2,
  Globe,
  Hourglass,
  Home,
  Terminal,
  Timer,
  LayoutGrid,
  type LucideIcon,
  MapPin,
  MessageSquare,
  Monitor,
  PenTool,
  Smartphone,
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
import { toWebApplicationRoute } from '../consts/routes';
import WEB_APPLICATIONS from '../consts/webApplications.json';

export type WebApplicationEntry = {
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
  games: Gamepad2,
  bookmarks: Bookmark,
  calendars: CalendarDays,
  career: Briefcase,
  chat: MessageSquare,
  'context-md': Bot,
  'cloud-8-skate': Bike,
  'component-library': LayoutGrid,
  'docs-md': BookOpen,
  'grind-75-react': Code,
  'find-me': MapPin,
  'gravity-guy': Gamepad2,
  'gravity-guy-staging': Gamepad2,
  'harry-liu': User,
  hearth: Home,
  'local-manager': Monitor,
  'mobile-manager': Smartphone,
  pomodoro: Timer,
  tasks: CheckSquare,
  utilities: Wrench,
  'waiting-games': Hourglass,
  weather: CloudSun,
  'web-terminal': Terminal,
  whiteboard: PenTool,
  'employee-handler': Users,
  'job-hunt': Briefcase,
};

export function ApplicationCards({
  entries,
  directLinks = false,
}: {
  entries: readonly WebApplicationEntry[];
  directLinks?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {entries
        .map(({ id, href, titleKey, descriptionKey }) => {
          const Icon = CARD_ICONS[id] ?? FALLBACK_ICON;
          return {
            id,
            href: directLinks ? href : toWebApplicationRoute(id),
            title: t(titleKey as TranslationKey),
            description: t(descriptionKey as TranslationKey),
            icon: <Icon className={ICON_CLASS} aria-hidden="true" />,
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(card => (
          <li key={card.href}>
            <CardLink {...card} route={!directLinks} />
          </li>
        ))}
    </>
  );
}

export function WebApplicationsPage() {
  const { t } = useTranslation();
  return (
    <main className={PAGE_CLASS}>
      <PageHeader title={t('WEB_APPLICATIONS_PAGE.TITLE')} />

      <section className="mb-12">
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_APPS')}
        </SectionHeading>
        <CardGrid>
          <ApplicationCards entries={WEB_APPLICATIONS.applications} />
        </CardGrid>
      </section>

      <section className="mb-12">
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_DEMO')}
        </SectionHeading>
        <CardGrid>
          <ApplicationCards entries={WEB_APPLICATIONS.demos} />
        </CardGrid>
      </section>

      <section>
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_PRIVATE')}
        </SectionHeading>
        <CardGrid>
          <ApplicationCards entries={WEB_APPLICATIONS.private} />
        </CardGrid>
      </section>
    </main>
  );
}
