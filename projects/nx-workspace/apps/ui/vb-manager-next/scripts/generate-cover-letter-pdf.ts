import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from '@playwright/test';
import { RESUME_LOCATION, resumeData } from '@vigilant-broccoli/resume';

const [inputPath, outputPath, titleOverride] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error(
    'Usage: generate-cover-letter-pdf.ts <letter.txt> <output.pdf> [header title]',
  );
  process.exit(1);
}

const PAGE_MARGIN_IN = 0.8;
const BODY_FONT_SIZE_PX = 13;
const BODY_LINE_HEIGHT = 1.45;
const PAGE_COUNT_PATTERN = /\/Type\s*\/Page[^s]/g;
const MAX_PAGES = 1;
const PHONE_DIAL_STRIP_PATTERN = /[^\d+]/g;
const BULLET_PREFIX = '- ';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderInline = (text: string): string =>
  escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

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

const buildHtml = (letter: string): string => {
  const { name, email, phone, links } = resumeData.basics;
  const title = titleOverride ?? resumeData.basics.title;
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
    <span>${escapeHtml(RESUME_LOCATION)}</span>
  </div>
</div>
${body}
</body></html>`;
};

const main = async (): Promise<void> => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(readFileSync(inputPath, 'utf-8')));
    const pdf = await page.pdf({ format: 'Letter', printBackground: true });
    const pages = pdf.toString('latin1').match(PAGE_COUNT_PATTERN)?.length ?? 0;
    if (pages > MAX_PAGES) {
      console.error(`Cover letter spans ${pages} pages; shorten it to one.`);
      process.exit(1);
    }
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, pdf);
    console.log(`Cover letter PDF written to ${outputPath}`);
  } finally {
    await browser.close();
  }
};

main();
