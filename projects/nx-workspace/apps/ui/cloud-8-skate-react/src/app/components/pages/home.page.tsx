import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import {
  EXTERNAL_URL,
  ROUTE_PATH,
  SITE_CONTENT,
} from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { MarkdownPage } from '../global/markdown-page';
import { CalendarSection } from '../features/calendar-section';
import { SkyCanvas } from '../features/sky-canvas';

const SECTION_ID = {
  HERO: 'hero-section',
  ABOUT: 'about-section',
  CALENDAR: 'calendar-section',
} as const;

type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];

const SECTION_ORDER: SectionId[] = [
  SECTION_ID.HERO,
  SECTION_ID.ABOUT,
  SECTION_ID.CALENDAR,
];

const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'start',
};

const CHEVRON_DOWN_PATH = 'M19 9l-7 7-7-7';
const CHEVRON_UP_PATH = 'M5 15l7-7 7 7';

const CHIP_CLASSES =
  'inline-flex items-center justify-center px-5 py-3 font-medium text-center text-white bg-blue-500 rounded-full hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 text-base interactive-chip';

const CARD_CLASSES =
  'rounded-2xl bg-white/70 backdrop-blur-md shadow-lg p-6 lg:p-10';

const scrollToSection = (sectionId: SectionId) =>
  document.getElementById(sectionId)?.scrollIntoView(SCROLL_OPTIONS);

const isLastSection = (sectionId: SectionId) =>
  SECTION_ORDER[SECTION_ORDER.length - 1] === sectionId;

const scrollToNext = (sectionId: SectionId) => {
  const nextSectionId = SECTION_ORDER[SECTION_ORDER.indexOf(sectionId) + 1];
  if (nextSectionId) {
    scrollToSection(nextSectionId);
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function ScrollButton({ sectionId }: { sectionId: SectionId }) {
  const { t } = useTranslation();
  const isLast = isLastSection(sectionId);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <button
        type="button"
        onClick={() => scrollToNext(sectionId)}
        className="floating-bob"
        aria-label={isLast ? t('HOME.SCROLL_TOP') : t('HOME.SCROLL_NEXT')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isLast ? CHEVRON_UP_PATH : CHEVRON_DOWN_PATH}
          />
        </svg>
      </button>
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  useSeo({
    title: t('SEO.HOME.TITLE'),
    description: t('SEO.HOME.DESCRIPTION'),
    keywords: t('SEO.HOME.KEYWORDS'),
  });

  return (
    <>
      <SkyCanvas />
      <section
        className="h-dvh relative"
        id={SECTION_ID.HERO}
        aria-label={t('HOME.HERO_LABEL')}
      >
        <div
          className={`absolute top-1/2 left-1/2 w-[90vw] max-w-[800px] -translate-x-1/2 -translate-y-1/2 text-center ${CARD_CLASSES}`}
        >
          <header className="mb-2 reveal-up reveal-up-delay-1">
            <h1 className="text-gray-900 text-center text-2xl lg:text-5xl font-extrabold">
              {t('HOME.TITLE')}
            </h1>
            <p className="text-gray-600 mb-4 text-lg lg:text-xl text-center italic">
              {t('HOME.TAGLINE')}
            </p>
          </header>
          <nav
            className="mx-auto flex w-fit flex-wrap justify-center gap-3 reveal-up reveal-up-delay-2"
            aria-label={t('HOME.QUICK_NAV_LABEL')}
          >
            <Link to={ROUTE_PATH.WAIVER} className={CHIP_CLASSES}>
              {t('HOME.WAIVER')}
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection(SECTION_ID.CALENDAR)}
              className={CHIP_CLASSES}
            >
              {t('HOME.CALENDAR')}
            </button>
            <a
              href={EXTERNAL_URL.CLOUD_8_SKATE_IG}
              target="_blank"
              rel="noopener noreferrer"
              className={CHIP_CLASSES}
            >
              {t('HOME.INSTAGRAM')}
            </a>
          </nav>
        </div>
        <ScrollButton sectionId={SECTION_ID.HERO} />
      </section>
      <div className="lg:w-1/2 mx-auto pt-8 pb-8">
        <section
          className="flex h-dvh relative pl-2 pr-2"
          id={SECTION_ID.ABOUT}
        >
          <article className={`w-full m-auto ${CARD_CLASSES}`}>
            <MarkdownPage filepath={SITE_CONTENT.ABOUT} />
          </article>
          <ScrollButton sectionId={SECTION_ID.ABOUT} />
        </section>
        <section
          className="flex h-dvh relative pl-2 pr-2"
          id={SECTION_ID.CALENDAR}
        >
          <div className="w-full m-auto">
            <CalendarSection />
            <ScrollButton sectionId={SECTION_ID.CALENDAR} />
          </div>
        </section>
      </div>
    </>
  );
}
