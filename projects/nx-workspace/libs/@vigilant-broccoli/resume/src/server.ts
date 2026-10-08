import { chromium } from '@playwright/test';
import type { Browser } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { resumeData } from './index';
import {
  RESUME_PDF_FILL_TARGET,
  RESUME_PDF_MAX_PAGES,
  describeResumePdfLayout,
} from './resume.pdf.types';
import type {
  ResumePdfLayout,
  ResumePdfSectionLayout,
} from './resume.pdf.types';
import type { ResumeData, ResumeWorkExperience } from './resume.types';

const LINK_COLOR = '#1155cc';
const HEADING_COLOR = '#3d85c6';
const SKILL_SEPARATOR = ' · ';
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap';

const CSS_PX_PER_INCH = 96;
const LETTER_WIDTH_IN = 8.5;
const LETTER_HEIGHT_IN = 11;
const PAGE_MARGIN_IN = 0.2;
const PRINTABLE_WIDTH_PX = Math.floor(
  (LETTER_WIDTH_IN - PAGE_MARGIN_IN * 2) * CSS_PX_PER_INCH,
);
const PRINTABLE_HEIGHT_PX = Math.floor(
  (LETTER_HEIGHT_IN - PAGE_MARGIN_IN * 2) * CSS_PX_PER_INCH,
);
const BODY_FONT_SIZE_PX = 13;
const BODY_LINE_HEIGHT = 1.375;
const LINE_HEIGHT_PX = BODY_FONT_SIZE_PX * BODY_LINE_HEIGHT;

const CONTENT_LOAD_TIMEOUT_MS = 15_000;
const FONT_LOAD_TIMEOUT_MS = 5_000;
const BROWSER_LAUNCH_TIMEOUT_MS = 30_000;
const FONT_FAMILY_CHECK = `${BODY_FONT_SIZE_PX}px Roboto`;
const FONT_STYLESHEET_SELECTOR = 'link[rel="stylesheet"]';
const LAYOUT_ATTRIBUTE = 'data-layout';
const LAYOUT_SECTION_SELECTOR = `[${LAYOUT_ATTRIBUTE}]`;
const LAYOUT_NAME = {
  HEADER: 'header',
  SUMMARY: 'summary',
  SKILLS: 'skills',
  WORK_EXPERIENCE: 'work experience',
  OPEN_SOURCE: 'open source',
} as const;

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderInlineBold = (text: string): string =>
  escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const renderBulletList = (bullets: string[]): string =>
  `<ul>${bullets.map(bullet => `<li>${renderInlineBold(bullet)}</li>`).join('')}</ul>`;

const renderWorkExperience = (entry: ResumeWorkExperience): string => `
  <div class="entry">
    <div class="entry-header">
      <span class="bold">${escapeHtml(entry.company)} - ${escapeHtml(entry.role)}</span>
      <span class="dates">${escapeHtml(entry.startDate)} - ${escapeHtml(entry.endDate)}</span>
    </div>
    ${renderBulletList(entry.bullets)}
  </div>`;

const buildResumeHtml = (resume: ResumeData): string => {
  const { basics, summary, workExperience, projectExperience, skills } = resume;
  const trimmedSummary = summary?.trim();

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${GOOGLE_FONTS_URL}" />
<style>
  @page { size: letter; margin: ${PAGE_MARGIN_IN}in; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Roboto', Arial, sans-serif;
    font-size: ${BODY_FONT_SIZE_PX}px;
    line-height: ${BODY_LINE_HEIGHT};
    color: #000;
    margin: 0;
  }
  a { color: ${LINK_COLOR}; text-decoration: underline; }
  .bold { font-weight: 700; }
  .italic { font-style: italic; }
  .header { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: start; margin-bottom: 8px; }
  .header .links { display: flex; flex-direction: column; gap: 2px; }
  .header .contact { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .header .identity { text-align: center; }
  .header .identity h1 { font-size: 24px; margin: 0; }
  .header .identity p { font-size: 13px; font-weight: 700; margin: 0; }
  .summary { margin: 0 0 8px; }
  section { margin-bottom: 8px; }
  h2 {
    font-size: 16px;
    font-weight: 700;
    color: ${HEADING_COLOR};
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    margin: 0 0 6px;
  }
  .entry { margin-bottom: 10px; }
  .entry:last-child { margin-bottom: 0; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .dates { white-space: nowrap; }
  ul { margin: 2px 0 0; padding-left: 20px; }
  li { margin-bottom: 2px; }
</style>
</head>
<body>
  <div class="header" ${LAYOUT_ATTRIBUTE}="${LAYOUT_NAME.HEADER}">
    <div class="links">
      ${basics.links.map(link => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`).join('')}
    </div>
    <div class="identity">
      <h1>${escapeHtml(basics.name)}</h1>
      <p>${escapeHtml(basics.title)}</p>
    </div>
    <div class="contact">
      <a href="mailto:${escapeHtml(basics.email)}">${escapeHtml(basics.email)}</a>
      <span>${escapeHtml(basics.phone)}</span>
    </div>
  </div>

  ${trimmedSummary ? `<p class="summary" ${LAYOUT_ATTRIBUTE}="${LAYOUT_NAME.SUMMARY}">${escapeHtml(trimmedSummary)}</p>` : ''}

  <p class="summary" ${LAYOUT_ATTRIBUTE}="${LAYOUT_NAME.SKILLS}">${escapeHtml(skills.technical.join(SKILL_SEPARATOR))}</p>

  <section ${LAYOUT_ATTRIBUTE}="${LAYOUT_NAME.WORK_EXPERIENCE}">
    <h2>Work Experience</h2>
    ${workExperience.map(renderWorkExperience).join('')}
  </section>

  <section ${LAYOUT_ATTRIBUTE}="${LAYOUT_NAME.OPEN_SOURCE}">
    <h2>Open Source</h2>
    ${projectExperience.map(renderWorkExperience).join('')}
  </section>
</body>
</html>`;
};

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<T>(resolve => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const countPdfPages = async (pdf: Buffer): Promise<number> => {
  const pageCount = (await PDFDocument.load(pdf)).getPageCount();
  if (pageCount < 1) throw new Error('Rendered resume PDF has no pages.');
  return pageCount;
};

const buildLayout = (
  pageCount: number,
  contentHeightPx: number,
  fontsLoaded: boolean,
  sections: ResumePdfSectionLayout[],
): ResumePdfLayout => {
  const roundedContentPx = Math.ceil(contentHeightPx);
  const overflowPx = Math.max(0, roundedContentPx - PRINTABLE_HEIGHT_PX);
  const unusedPx = Math.max(0, PRINTABLE_HEIGHT_PX - roundedContentPx);
  const targetMinContentPx = Math.ceil(
    PRINTABLE_HEIGHT_PX * RESUME_PDF_FILL_TARGET.MIN_RATIO,
  );
  const fits = pageCount <= RESUME_PDF_MAX_PAGES;
  return {
    pageCount,
    maxPages: RESUME_PDF_MAX_PAGES,
    fits,
    contentHeightPx: roundedContentPx,
    pageContentHeightPx: PRINTABLE_HEIGHT_PX,
    overflowPx,
    overflowLines: Math.ceil(overflowPx / LINE_HEIGHT_PX),
    unusedPx,
    unusedLines: Math.floor(unusedPx / LINE_HEIGHT_PX),
    fillRatio: Math.round((roundedContentPx / PRINTABLE_HEIGHT_PX) * 100) / 100,
    targetMinContentPx,
    targetMaxContentPx: Math.floor(
      PRINTABLE_HEIGHT_PX * RESUME_PDF_FILL_TARGET.MAX_RATIO,
    ),
    underfilled: fits && roundedContentPx < targetMinContentPx,
    fontsLoaded,
    sections,
  };
};

export interface ResumePdfRender {
  pdf: Buffer;
  layout: ResumePdfLayout;
}

export class ResumePdfOverflowError extends Error {
  readonly layout: ResumePdfLayout;

  constructor(layout: ResumePdfLayout) {
    super(`${describeResumePdfLayout(layout)} Shorten the resume.`);
    this.name = 'ResumePdfOverflowError';
    this.layout = layout;
  }
}

const renderWithBrowser = async (
  browser: Browser,
  resume: ResumeData,
): Promise<ResumePdfRender> => {
  const page = await browser.newPage({
    viewport: { width: PRINTABLE_WIDTH_PX, height: PRINTABLE_HEIGHT_PX },
  });
  try {
    await page.emulateMedia({ media: 'print' });
    await page.setContent(buildResumeHtml(resume), {
      waitUntil: 'domcontentloaded',
      timeout: CONTENT_LOAD_TIMEOUT_MS,
    });

    const fontsLoaded = await withTimeout(
      page.evaluate(async (family: string) => {
        const stylesheet = document.querySelector('link[rel="stylesheet"]');
        await new Promise<void>(resolve => {
          if (!(stylesheet instanceof HTMLLinkElement) || stylesheet.sheet) {
            resolve();
            return;
          }
          stylesheet.addEventListener('load', () => resolve());
          stylesheet.addEventListener('error', () => resolve());
        });
        await document.fonts.load(family);
        await document.fonts.ready;
        return Array.from(document.fonts).some(
          face => face.status === 'loaded',
        );
      }, FONT_FAMILY_CHECK),
      FONT_LOAD_TIMEOUT_MS,
      false,
    );
    if (!fontsLoaded) {
      await page.evaluate((selector: string) => {
        document.querySelector(selector)?.remove();
      }, FONT_STYLESHEET_SELECTOR);
    }

    const measured = await page.evaluate(
      (selector: string) => ({
        contentHeightPx: document.body.getBoundingClientRect().height,
        sections: Array.from(document.querySelectorAll(selector)).map(
          element => ({
            name: element.getAttribute('data-layout') ?? '',
            heightPx: Math.ceil(element.getBoundingClientRect().height),
          }),
        ),
      }),
      LAYOUT_SECTION_SELECTOR,
    );

    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
    });
    const pageCount = await countPdfPages(pdf);

    return {
      pdf,
      layout: buildLayout(
        pageCount,
        measured.contentHeightPx,
        fontsLoaded,
        measured.sections,
      ),
    };
  } finally {
    await page.close();
  }
};

export async function renderResumePdf(
  resume: ResumeData,
): Promise<ResumePdfRender> {
  const browser = await chromium.launch({
    timeout: BROWSER_LAUNCH_TIMEOUT_MS,
  });
  try {
    return await renderWithBrowser(browser, resume);
  } finally {
    await browser.close();
  }
}

export async function generateResumePdfBuffer(
  resume: ResumeData = resumeData,
): Promise<Buffer> {
  const { pdf, layout } = await renderResumePdf(resume);
  if (!layout.fits) throw new ResumePdfOverflowError(layout);
  return pdf;
}
