import { chromium } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { RESUME_LOCATION } from './resume.types';
import type { ResumeData } from './resume.types';

const PAGE_MARGIN_IN = 0.8;
const BODY_FONT_SIZE_PX = 13;
const BODY_LINE_HEIGHT = 1.45;
const MAX_PAGES = 1;
const PHONE_DIAL_STRIP_PATTERN = /[^\d+]/g;
const BULLET_PREFIX = '- ';

export class CoverLetterPdfOverflowError extends Error {
  readonly pageCount: number;

  constructor(pageCount: number) {
    super(`Cover letter spans ${pageCount} pages; shorten it to one.`);
    this.name = 'CoverLetterPdfOverflowError';
    this.pageCount = pageCount;
  }
}

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Letters are plain text; markers left in an older letter are dropped rather
// than rendered, so the PDF matches the .txt.
const renderInline = (text: string): string =>
  escapeHtml(text).replace(/\*\*/g, '');

const renderBlock = (block: string): string => {
  const lines = block.split('\n');
  if (lines.every(line => line.startsWith(BULLET_PREFIX))) {
    const items = lines
      .map(line => `<li>${renderInline(line.slice(BULLET_PREFIX.length))}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  }
  return `<p>${lines.map(renderInline).join('<br />')}</p>`;
};

// The header mirrors the resume's three columns: links, name and title,
// contact. Like the resume PDF, an unset location falls back to
// RESUME_LOCATION; an empty one is left out.
const buildHtml = (resume: ResumeData, letter: string, title: string) => {
  const { name, email, phone, links } = resume.basics;
  const location = resume.basics.location ?? RESUME_LOCATION;
  const linkLines = links
    .map(
      ({ label, url }) =>
        `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`,
    )
    .join('');
  const body = letter
    .trim()
    .split(/\n{2,}/)
    .map(renderBlock)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8" /><style>
  @page { size: letter; margin: ${PAGE_MARGIN_IN}in; }
  body { font-family: Arial, sans-serif; font-size: ${BODY_FONT_SIZE_PX}px; line-height: ${BODY_LINE_HEIGHT}; color: #000; margin: 0; }
  a { color: #1155cc; }
  .header { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: start; margin-bottom: 18px; }
  .header .links { display: flex; flex-direction: column; gap: 2px; }
  .header .contact { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .header .identity { text-align: center; }
  .header .identity h1 { font-size: 24px; margin: 0; }
  .header .identity p { font-weight: 700; margin: 0; }
  p { margin: 0 0 12px; }
  ul { margin: 0 0 12px; padding-left: 22px; }
  li { margin-bottom: 3px; }
</style></head><body>
<div class="header">
  <div class="links">${linkLines}</div>
  <div class="identity"><h1>${escapeHtml(name)}</h1><p>${escapeHtml(title)}</p></div>
  <div class="contact">
    <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
    <a href="tel:${escapeHtml(phone.replace(PHONE_DIAL_STRIP_PATTERN, ''))}">${escapeHtml(phone)}</a>
    ${location ? `<span>${escapeHtml(location)}</span>` : ''}
  </div>
</div>
${body}
</body></html>`;
};

// Renders a plain-text letter (blank-line-separated blocks, `- ` bullets)
// under the resume's header; throws CoverLetterPdfOverflowError past one page.
export async function generateCoverLetterPdfBuffer(
  resume: ResumeData,
  letter: string,
  title: string = resume.basics.title,
): Promise<Buffer> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(resume, letter, title));
    const pdf = await page.pdf({ format: 'Letter', printBackground: true });
    const pageCount = (await PDFDocument.load(pdf)).getPageCount();
    if (pageCount > MAX_PAGES) throw new CoverLetterPdfOverflowError(pageCount);
    return pdf;
  } finally {
    await browser.close();
  }
}
