import { mkdirSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright';

const OUTPUT_DIR = 'screenshots';
const COLOR_SCHEMES = ['light', 'dark'] as const;
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

const toFileName = (url: URL, viewport: string, scheme: string) => {
  const slug = `${url.host}${url.pathname}${url.search}`
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-${viewport}-${scheme}.png`;
};

const main = async () => {
  const urls = process.argv.slice(2).filter(arg => arg !== '--');
  if (!urls.length) {
    console.error('Usage: pnpm screenshot:themes -- <url> [<url>...]');
    process.exit(1);
  }
  const parsed = urls.map(url => new URL(url));
  const remote = parsed.find(url => !LOCAL_HOSTS.includes(url.hostname));
  if (remote) {
    console.error(
      `Refusing non-local URL ${remote.href}; use a local dev server.`,
    );
    process.exit(1);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      for (const colorScheme of COLOR_SCHEMES) {
        const context = await browser.newContext({ viewport, colorScheme });
        const page = await context.newPage();
        for (const url of parsed) {
          await page.goto(url.href, { waitUntil: 'networkidle' });
          const path = join(
            OUTPUT_DIR,
            toFileName(url, viewportName, colorScheme),
          );
          await page.screenshot({ path, fullPage: true });
          console.log(path);
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
};

main();
