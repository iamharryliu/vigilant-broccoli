import { chromium } from '@playwright/test';
import { resumeData } from './index';
import type {
  ResumeData,
  ResumeWorkExperience,
  ResumePersonalProject,
} from './resume.types';

const LINK_COLOR = '#1155cc';
const HEADING_COLOR = '#3d85c6';
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap';

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

const renderPersonalProject = (project: ResumePersonalProject): string => `
  <div class="entry">
    <div>
      <span class="bold">${escapeHtml(project.name)}</span> -
      <a href="${escapeHtml(project.url)}">${escapeHtml(project.url)}</a>
      ${project.tags ? ` - ${escapeHtml(project.tags)}` : ''}
      ${project.tagline ? ` - <span class="italic">${escapeHtml(project.tagline)}</span>` : ''}
    </div>
    ${renderBulletList(project.bullets)}
  </div>`;

const buildResumeHtml = (resume: ResumeData): string => {
  const { basics, summary, workExperience, skills, personalProjects } = resume;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${GOOGLE_FONTS_URL}" />
<style>
  @page { size: letter; margin: 0.2in; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Roboto', Arial, sans-serif;
    font-size: 13px;
    line-height: 1.27;
    color: #000;
    margin: 0;
  }
  a { color: ${LINK_COLOR}; text-decoration: underline; }
  .bold { font-weight: 700; }
  .italic { font-style: italic; }
  .header { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: start; margin-bottom: 6px; }
  .header .links { display: flex; flex-direction: column; gap: 2px; }
  .header .contact { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .header .identity { text-align: center; }
  .header .identity h1 { font-size: 24px; margin: 0; }
  .header .identity p { font-size: 13px; font-weight: 700; margin: 2px 0 0; }
  .summary { margin-bottom: 6px; }
  section { margin-bottom: 4px; }
  h2 {
    font-size: 16px;
    font-weight: 700;
    color: ${HEADING_COLOR};
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    margin: 0 0 3px;
  }
  .entry { margin-bottom: 5px; }
  .entry:last-child { margin-bottom: 0; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .dates { white-space: nowrap; }
  ul { margin: 2px 0 0; padding-left: 20px; }
  li { margin-bottom: 1px; }
</style>
</head>
<body>
  <div class="header">
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

  <p class="summary">${escapeHtml(summary)}</p>

  <section>
    <h2>Work Experience</h2>
    ${workExperience.map(renderWorkExperience).join('')}
  </section>

  <section>
    <h2>Skills</h2>
    <p><span class="bold">Technical: </span>${escapeHtml(skills.technical.join(', '))}.</p>
    <p class="bold" style="margin-top: 4px;">Soft:</p>
    ${renderBulletList(skills.soft)}
  </section>

  <section>
    <h2>Personal Projects</h2>
    ${personalProjects.map(renderPersonalProject).join('')}
  </section>
</body>
</html>`;
};

export async function generateResumePdfBuffer(): Promise<Buffer> {
  const html = buildResumeHtml(resumeData);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    return await page.pdf({ preferCSSPageSize: true, printBackground: true });
  } finally {
    await browser.close();
  }
}
