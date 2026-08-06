// Usage:
//   node scrape-facebook-events.mjs [groupEventsUrl]
//     --headed     show the browser while scraping (default: headless)
//     --past       also include past events (default: upcoming only)
//     --out FILE   write JSON to FILE instead of stdout
//
// Reuses your real Chrome login by copying your local Chrome profile's session
// cookies into a separate profile dir on each run, then driving actual Chrome
// (not the bundled test browser) against the copy. Chrome enforces that remote
// debugging can't attach to your default profile directly (security hardening),
// so a copied profile is the closest available approximation — your normal
// Chrome window is never touched and doesn't need to be closed.

import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_DEFAULT_PROFILE_NAME = 'Default';
const CHROME_USER_DATA_DIR = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
const LOCAL_PROFILE_DIR = path.join(__dirname, 'chrome-profile');
const ROOT_FILES_TO_SYNC = ['Local State'];
const COOKIES_FILENAME = 'Cookies';
const DEFAULT_PROFILE_FILES_TO_SYNC = [COOKIES_FILENAME, 'Cookies-journal', 'Cookies-wal', 'Cookies-shm'];
const SINGLETON_LOCK_FILES = ['SingletonLock', 'SingletonCookie', 'SingletonSocket'];

const FACEBOOK_BASE_URL = 'https://www.facebook.com';
const DEFAULT_GROUP_EVENTS_URL = `${FACEBOOK_BASE_URL}/groups/klubbkalenderlatin/events`;
const LOGIN_REDIRECT_PATH = '/login';
const EVENT_LINK_SELECTOR = 'a[href*="/events/"]';

const SEE_MORE_TEXT = 'See more';
const MAX_EXPAND_ROUNDS = 60;
const EXPAND_CLICK_DELAY_MS = 800;
const EVENT_ID_PATTERN = /\/events\/(\d+)\/?/;
const SHARED_BY_PREFIX = 'Shared by ';
const PAST_EVENTS_HEADING = 'Past events';

const parseArgs = argv => ({
  groupUrl: argv.find(arg => arg.startsWith('http')) ?? DEFAULT_GROUP_EVENTS_URL,
  includePast: argv.includes('--past'),
  headed: argv.includes('--headed'),
  outPath: argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : undefined,
});

const copyIfExists = async (src, dest) => {
  if (!existsSync(src)) return false;
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(src, dest);
  return true;
};

const syncChromeProfile = async () => {
  await mkdir(LOCAL_PROFILE_DIR, { recursive: true });

  for (const file of ROOT_FILES_TO_SYNC) {
    await copyIfExists(path.join(CHROME_USER_DATA_DIR, file), path.join(LOCAL_PROFILE_DIR, file));
  }

  let copiedCookies = false;
  for (const file of DEFAULT_PROFILE_FILES_TO_SYNC) {
    const copied = await copyIfExists(
      path.join(CHROME_USER_DATA_DIR, CHROME_DEFAULT_PROFILE_NAME, file),
      path.join(LOCAL_PROFILE_DIR, CHROME_DEFAULT_PROFILE_NAME, file),
    );
    if (file === COOKIES_FILENAME && copied) copiedCookies = true;
  }

  if (!copiedCookies) {
    console.error(`No Chrome cookies found at ${path.join(CHROME_USER_DATA_DIR, CHROME_DEFAULT_PROFILE_NAME, COOKIES_FILENAME)}`);
    process.exit(1);
  }
};

// A prior run that exited abnormally (crash, kill, Ctrl-C) can leave Chrome's
// singleton lock files behind, which blocks every subsequent launch against
// this profile until they're removed.
const clearStaleSingletonLockFiles = () =>
  Promise.all(SINGLETON_LOCK_FILES.map(file => rm(path.join(LOCAL_PROFILE_DIR, file), { force: true })));

const clickNextSeeMoreButton = page =>
  page.evaluate(seeMoreText => {
    const button = [...document.querySelectorAll('div[role="button"]')].find(el => el.textContent.trim() === seeMoreText);
    if (!button) return false;
    button.click();
    return true;
  }, SEE_MORE_TEXT);

const clickAllSeeMoreButtons = async page => {
  for (let round = 0; round < MAX_EXPAND_ROUNDS; round++) {
    const clicked = await clickNextSeeMoreButton(page);
    if (!clicked) break;
    await page.waitForTimeout(EXPAND_CLICK_DELAY_MS);
  }
};

const extractEvents = page =>
  page.evaluate(
    ({ eventLinkSelector, eventIdPatternSource, sharedByPrefix, pastEventsHeading, facebookBaseUrl }) => {
      const eventIdPattern = new RegExp(eventIdPatternSource);
      const anchors = [...document.querySelectorAll(eventLinkSelector)].filter(a =>
        eventIdPattern.test(new URL(a.href, location.href).pathname),
      );

      const pastHeading = [...document.querySelectorAll('span, div, h2')].find(
        el => el.children.length === 0 && el.textContent.trim() === pastEventsHeading,
      );

      const seen = new Set();
      const events = [];
      for (const anchor of anchors) {
        const id = new URL(anchor.href, location.href).pathname.match(eventIdPattern)?.[1];
        if (!id || seen.has(id)) continue;
        seen.add(id);

        const card = anchor.parentElement?.parentElement;
        const lines = (card?.innerText || '').split('\n').filter(Boolean);
        const [when, title, maybeSharedBy] = lines;
        if (!title) continue;

        const sharedBy = maybeSharedBy?.startsWith(sharedByPrefix) ? maybeSharedBy.slice(sharedByPrefix.length) : undefined;

        const isBeforePastHeading =
          !pastHeading || Boolean(card.compareDocumentPosition(pastHeading) & Node.DOCUMENT_POSITION_FOLLOWING);

        events.push({
          id,
          title,
          when,
          sharedBy,
          section: isBeforePastHeading ? 'upcoming' : 'past',
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
    },
  );

const runScrape = async ({ groupUrl, includePast, headed, outPath }) => {
  await syncChromeProfile();
  await clearStaleSingletonLockFiles();

  const context = await chromium.launchPersistentContext(LOCAL_PROFILE_DIR, {
    channel: 'chrome',
    headless: !headed,
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  const page = context.pages()[0] ?? (await context.newPage());

  await page.goto(groupUrl, { waitUntil: 'domcontentloaded' });

  if (page.url().includes(LOGIN_REDIRECT_PATH)) {
    await context.close();
    console.error('Redirected to the Facebook login page — log in to Facebook in your normal Chrome and try again.');
    process.exit(1);
  }

  await page.waitForSelector(EVENT_LINK_SELECTOR, { timeout: 15000 }).catch(() => {});
  await clickAllSeeMoreButtons(page);

  const events = await extractEvents(page);
  const filtered = includePast ? events : events.filter(event => event.section === 'upcoming');

  await context.close();

  const output = JSON.stringify(filtered, null, 2);
  if (outPath) {
    await writeFile(outPath, output);
    console.log(`Wrote ${filtered.length} events to ${outPath}`);
  } else {
    console.log(output);
  }
};

runScrape(parseArgs(process.argv.slice(2)));
