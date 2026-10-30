import {
  Bike,
  BookOpen,
  Bookmark,
  Bot,
  Briefcase,
  CalendarDays,
  CloudSun,
  Gamepad2,
  Globe,
  Hourglass,
  Home,
  Terminal,
  Timer,
  LayoutGrid,
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
import { GAMES_ROUTE, toWebApplicationRoute } from '../consts/routes';
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
  'context-md': Bot,
  'cloud-8-skate': Bike,
  'component-library': LayoutGrid,
  'docs-md': BookOpen,
  'find-me': MapPin,
  'gravity-guy': Gamepad2,
  'gravity-guy-staging': Gamepad2,
  'harry-liu': User,
  hearth: Home,
  pomodoro: Timer,
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
  games = false,
}: {
  entries: readonly WebApplicationEntry[];
  games?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {entries
        .map(({ id, href, titleKey, descriptionKey }) => {
          const Icon = CARD_ICONS[id] ?? FALLBACK_ICON;
          return {
            id,
            href: games ? href : toWebApplicationRoute(id),
            title: t(titleKey as TranslationKey),
            description: t(descriptionKey as TranslationKey),
            icon: <Icon className={ICON_CLASS} aria-hidden="true" />,
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(card => (
          <li key={card.href}>
            <CardLink {...card} route={!games} />
            {games && (
              <a
                className="inline-block mt-2 text-sm underline underline-offset-4"
                href={`#${GAMES_ROUTE}/${card.id}`}
              >
                {t('GAMES_PAGE.ABOUT', { title: card.title })}
              </a>
            )}
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

      <section>
        <SectionHeading>
          {t('WEB_APPLICATIONS_PAGE.SECTION_DEMO')}
        </SectionHeading>
        <CardGrid>
          <ApplicationCards entries={WEB_APPLICATIONS.demos} />
        </CardGrid>
      </section>
    </main>
  );
}
