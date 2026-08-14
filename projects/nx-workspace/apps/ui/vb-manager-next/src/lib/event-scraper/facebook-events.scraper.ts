import { chromium, BrowserContext, Page } from 'playwright';
import { existsSync } from 'fs';
import { mkdir, copyFile, rm } from 'fs/promises';
import os from 'os';
import path from 'path';

// Reuses the local Chrome login by copying that profile's session cookies
// into a separate profile dir,
// then driving real Chrome against the copy — Chrome refuses remote-debugging
// attach to the default profile, so a copy is the closest equivalent and the
// user's own Chrome window is never touched.

const CHROME_DEFAULT_PROFILE_NAME = 'Default';
const CHROME_USER_DATA_DIR = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Google',
  'Chrome',
);
const LOCAL_PROFILE_DIR = path.join(
  process.env.VB_MANAGER_DATA_DIR ?? path.join(os.homedir(), '.vb-manager'),
  'chrome-profile',
);
const ROOT_FILES_TO_SYNC = ['Local State'];
const COOKIES_FILENAME = 'Cookies';
const DEFAULT_PROFILE_FILES_TO_SYNC = [
  COOKIES_FILENAME,
  'Cookies-journal',
  'Cookies-wal',
  'Cookies-shm',
];
const SINGLETON_LOCK_FILES = [
  'SingletonLock',
  'SingletonCookie',
  'SingletonSocket',
];

const LOGIN_REDIRECT_PATH = '/login';
const EVENT_LINK_SELECTOR = 'a[href*="/events/"]';
const NAV_WAIT_UNTIL = 'domcontentloaded';
const FACEBOOK_BASE_URL = 'https://www.facebook.com';
const SECTION_UPCOMING = 'upcoming';
const SECTION_PAST = 'past';

const SEE_MORE_TEXT = 'See more';
const SEE_LESS_TEXT = 'See less';
const MAX_EXPAND_ROUNDS = 60;
const EXPAND_CLICK_DELAY_MS = 800;
const EVENT_ID_PATTERN = /\/events\/(\d+)\/?/;
const SHARED_BY_PREFIX = 'Shared by ';
const PAST_EVENTS_HEADING = 'Past events';
// An event card isn't at a fixed depth above its link: group listings nest it
// ~2 levels up, a page's /events tab ~6. So walk up from the link to the widest
// ancestor that still wraps a single event (stopping before it pulls in a
// second event's link) — that block holds the date/title/location lines.
const MAX_CARD_WALK = 12;

const EVENT_LIST_TIMEOUT_MS = 15000;
const EVENT_DETAIL_NAV_DELAY_MS = 2000;
const EVENT_DETAIL_VISIT_DELAY_MS = 1000;
const DEFAULT_CONCURRENCY = 4;
const MIN_DETAIL_TEXT_LENGTH = 30;
const DATE_TIME_PATTERN =
  /^[A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2}(,\s*\d{4})?\s+at\s+\d{1,2}:\d{2}\s*[AP]M/;
const PRIVACY_LINE_PATTERN = /^(Public|Private|Friends)\b.*·/;
const LOCATION_ARIA_LABEL = 'Location information for this event';

export const NO_CHROME_COOKIES_ERROR =
  'No Chrome cookies found — sign in to Facebook in Chrome and retry';
export const FACEBOOK_LOGIN_REQUIRED_ERROR =
  'Facebook redirected to the login page — sign in to Facebook in Chrome and retry';

export interface ScrapedEvent {
  id: string;
  title: string;
  dateTime?: string;
  location?: string;
  description?: string;
  sharedBy?: string;
  section: string;
  url: string;
}

interface ListedEvent {
  id: string;
  title: string;
  when?: string;
  sharedBy?: string;
  section: string;
  url: string;
}

const copyIfExists = async (src: string, dest: string) => {
  if (!existsSync(src)) return false;
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(src, dest);
  return true;
};

const syncChromeProfile = async () => {
  await mkdir(LOCAL_PROFILE_DIR, { recursive: true });

  for (const file of ROOT_FILES_TO_SYNC) {
    await copyIfExists(
      path.join(CHROME_USER_DATA_DIR, file),
      path.join(LOCAL_PROFILE_DIR, file),
    );
  }

  let copiedCookies = false;
  for (const file of DEFAULT_PROFILE_FILES_TO_SYNC) {
    const copied = await copyIfExists(
      path.join(CHROME_USER_DATA_DIR, CHROME_DEFAULT_PROFILE_NAME, file),
      path.join(LOCAL_PROFILE_DIR, CHROME_DEFAULT_PROFILE_NAME, file),
    );
    if (file === COOKIES_FILENAME && copied) copiedCookies = true;
  }

  if (!copiedCookies) throw new Error(NO_CHROME_COOKIES_ERROR);
};

// A run that exited abnormally leaves Chrome's singleton locks behind, which
// blocks every subsequent launch against this profile until they're removed.
const clearStaleSingletonLockFiles = () =>
  Promise.all(
    SINGLETON_LOCK_FILES.map(file =>
      rm(path.join(LOCAL_PROFILE_DIR, file), { force: true }),
    ),
  );

const clickNextSeeMoreButton = (page: Page) =>
  page.evaluate(seeMoreText => {
    const button = [...document.querySelectorAll('div[role="button"]')].find(
      el => el.textContent?.trim() === seeMoreText,
    );
    if (!button) return false;
    (button as HTMLElement).click();
    return true;
  }, SEE_MORE_TEXT);

const clickAllSeeMoreButtons = async (page: Page) => {
  for (let round = 0; round < MAX_EXPAND_ROUNDS; round++) {
    if (!(await clickNextSeeMoreButton(page))) break;
    await page.waitForTimeout(EXPAND_CLICK_DELAY_MS);
  }
};

const extractEvents = (page: Page): Promise<ListedEvent[]> =>
  page.evaluate(
    ({
      eventLinkSelector,
      eventIdPatternSource,
      sharedByPrefix,
      pastEventsHeading,
      facebookBaseUrl,
      sectionUpcoming,
      sectionPast,
      maxCardWalk,
    }) => {
      const eventIdPattern = new RegExp(eventIdPatternSource);
      const idFromHref = (href: string) =>
        new URL(href, location.href).pathname.match(eventIdPattern)?.[1];
      const anchors = [
        ...document.querySelectorAll<HTMLAnchorElement>(eventLinkSelector),
      ].filter(a => idFromHref(a.href));

      const pastHeading = [...document.querySelectorAll('span, div, h2')].find(
        el =>
          el.children.length === 0 &&
          el.textContent?.trim() === pastEventsHeading,
      );

      // The event's link may appear more than once per card (image + title);
      // climb to the widest ancestor still scoped to this one event, keeping the
      // richest text seen so we get the full date/title/location block.
      const findCard = (anchor: HTMLElement) => {
        let el: HTMLElement | null = anchor;
        let card: HTMLElement | null = null;
        let bestLineCount = 0;
        for (let level = 0; level < maxCardWalk && el; level++) {
          const idsWithin = new Set(
            [...el.querySelectorAll<HTMLAnchorElement>(eventLinkSelector)]
              .map(a => idFromHref(a.href))
              .filter(Boolean),
          );
          if (idsWithin.size > 1) break;
          const lineCount = (el.innerText || '')
            .split('\n')
            .filter(line => line.trim()).length;
          if (lineCount >= bestLineCount) {
            card = el;
            bestLineCount = lineCount;
          }
          el = el.parentElement;
        }
        return card;
      };

      const seen = new Set<string>();
      const events = [];
      for (const anchor of anchors) {
        const id = idFromHref(anchor.href);
        if (!id || seen.has(id)) continue;
        seen.add(id);

        const card = findCard(anchor);
        const lines = (card?.innerText || '')
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
        const [when, title, maybeSharedBy] = lines;
        if (!title) continue;

        const sharedBy = maybeSharedBy?.startsWith(sharedByPrefix)
          ? maybeSharedBy.slice(sharedByPrefix.length)
          : undefined;

        const isBeforePastHeading =
          !pastHeading ||
          Boolean(
            card &&
              card.compareDocumentPosition(pastHeading) &
                Node.DOCUMENT_POSITION_FOLLOWING,
          );

        events.push({
          id,
          title,
          when,
          sharedBy,
          section: isBeforePastHeading ? sectionUpcoming : sectionPast,
          url: `${facebookBaseUrl}/events/${id}/`,
        });
      }
      return events;
    },
    {
      eventLinkSelector: EVENT_LINK_SELECTOR,
      eventIdPatternSource: EVENT_ID_PATTERN.source,
      sharedByPrefix: SHARED_BY_PREFIX,
      pastEventsHeading: PAST_EVENTS_HEADING,
      facebookBaseUrl: FACEBOOK_BASE_URL,
      sectionUpcoming: SECTION_UPCOMING,
      sectionPast: SECTION_PAST,
      maxCardWalk: MAX_CARD_WALK,
    },
  );

const extractEventDetails = (page: Page) =>
  page.evaluate(
    ({
      dateTimePatternSource,
      privacyLinePatternSource,
      locationAriaLabel,
      seeLessText,
      minDetailTextLength,
    }) => {
      const dateTimePattern = new RegExp(dateTimePatternSource);
      const privacyLinePattern = new RegExp(privacyLinePatternSource);

      const detailTexts = [...document.querySelectorAll('[dir="auto"]')]
        .map(el => el.textContent?.trim() ?? '')
        .filter(text => text.length > minDetailTextLength);

      const dateTime = detailTexts.find(text => dateTimePattern.test(text));

      const privacyLineIndex = detailTexts.findIndex(text =>
        privacyLinePattern.test(text),
      );
      let description =
        privacyLineIndex >= 0 ? detailTexts[privacyLineIndex + 1] : undefined;
      if (description?.endsWith(seeLessText)) {
        description = description.slice(0, -seeLessText.length).trim();
      }

      const locationText = (
        document.querySelector(
          `[aria-label="${locationAriaLabel}"]`,
        ) as HTMLElement | null
      )?.innerText;
      const location = locationText
        ?.split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join(', ');

      return { dateTime, location, description };
    },
    {
      dateTimePatternSource: DATE_TIME_PATTERN.source,
      privacyLinePatternSource: PRIVACY_LINE_PATTERN.source,
      locationAriaLabel: LOCATION_ARIA_LABEL,
      seeLessText: SEE_LESS_TEXT,
      minDetailTextLength: MIN_DETAIL_TEXT_LENGTH,
    },
  );

const enrichEventWithDetails = async (
  page: Page,
  event: ListedEvent,
): Promise<ScrapedEvent> => {
  await page.goto(event.url, { waitUntil: NAV_WAIT_UNTIL });

  let details: {
    dateTime?: string;
    location?: string;
    description?: string;
  } = {};
  if (!page.url().includes(LOGIN_REDIRECT_PATH)) {
    await page.waitForTimeout(EVENT_DETAIL_NAV_DELAY_MS);
    await clickAllSeeMoreButtons(page);
    details = await extractEventDetails(page);
  }

  return {
    id: event.id,
    title: event.title,
    dateTime: details.dateTime ?? event.when,
    location: details.location,
    description: details.description,
    sharedBy: event.sharedBy,
    section: event.section,
    url: event.url,
  };
};

const enrichEventsConcurrently = async (
  context: BrowserContext,
  listPage: Page,
  events: ListedEvent[],
  concurrency: number,
  onProgress?: (done: number, total: number) => void,
) => {
  const workerCount = Math.max(1, Math.min(concurrency, events.length));
  const extraPages = await Promise.all(
    Array.from({ length: workerCount - 1 }, () => context.newPage()),
  );
  const pages = [listPage, ...extraPages];

  const enriched = new Array<ScrapedEvent>(events.length);
  let nextIndex = 0;
  let completed = 0;

  const runWorker = async (page: Page) => {
    while (nextIndex < events.length) {
      const index = nextIndex++;
      enriched[index] = await enrichEventWithDetails(page, events[index]);
      onProgress?.(++completed, events.length);
      await page.waitForTimeout(EVENT_DETAIL_VISIT_DELAY_MS);
    }
  };

  await Promise.all(pages.map(runWorker));
  await Promise.all(extraPages.map(page => page.close()));

  return enriched;
};

// Works for any Facebook events listing — a group's /events tab or a page's,
// e.g. facebook.com/groups/<id>/events or facebook.com/<slug>/events — since
// both render the same event-link cards this walks.
export const scrapeFacebookEvents = async ({
  eventsUrl,
  includePast = false,
  concurrency = DEFAULT_CONCURRENCY,
  onProgress,
}: {
  eventsUrl: string;
  includePast?: boolean;
  concurrency?: number;
  onProgress?: (done: number, total: number) => void;
}): Promise<ScrapedEvent[]> => {
  await syncChromeProfile();
  await clearStaleSingletonLockFiles();

  const context = await chromium.launchPersistentContext(LOCAL_PROFILE_DIR, {
    channel: 'chrome',
    headless: true,
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(eventsUrl, { waitUntil: NAV_WAIT_UNTIL });

    if (page.url().includes(LOGIN_REDIRECT_PATH)) {
      throw new Error(FACEBOOK_LOGIN_REQUIRED_ERROR);
    }

    await page
      .waitForSelector(EVENT_LINK_SELECTOR, { timeout: EVENT_LIST_TIMEOUT_MS })
      .catch(() => undefined);
    await clickAllSeeMoreButtons(page);

    const events = await extractEvents(page);
    const filtered = includePast
      ? events
      : events.filter(event => event.section === SECTION_UPCOMING);

    return await enrichEventsConcurrently(
      context,
      page,
      filtered,
      concurrency,
      onProgress,
    );
  } finally {
    await context.close();
  }
};
