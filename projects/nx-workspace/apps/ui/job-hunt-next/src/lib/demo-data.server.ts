import { NextRequest, NextResponse } from 'next/server';
import {
  CONTENT_TYPE_HEADER,
  FILE_ENTRY_KIND,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  type FileEntry,
} from '@vigilant-broccoli/common-js';
import resume from '../../templates/sample/resume.json';
import careerExperience from '../../templates/sample/career-experience.md';
import { API_ENDPOINTS } from '../app/constants/api-endpoints';
import { CAREER_FILE_KIND } from '../app/constants/career';
import {
  RUN_KIND,
  RUN_STATUS,
  type JobApplicationRun,
} from '../app/constants/runs';
import en from '../app/i18n/en.json';

const SAMPLE_DATE = '2026-10-20T10:00:00.000Z';
const SAMPLE_FOLDER = '2026-10-20-Maple-Labs-Senior-Full-Stack-Developer';
const LETTER = `Dear Maple Labs hiring team,

I am applying for the Senior Full Stack Developer role. At Northwind Logistics, I led a Next.js and TypeScript tracking app rebuild with a component library shared by three teams. I also replaced polling with Kafka events and GraphQL subscriptions, bringing shipment updates to under five seconds.

Your focus on accessible products matches my work at Brightpath Health, where I led a WCAG 2.1 AA audit and fixed more than 120 issues. I would bring that same care for usability and reliable delivery to Maple Labs.

I would welcome the opportunity to discuss your team and its products.

Kind regards,
Jordan Rivera`;

const FILES: Record<string, { content?: string; document?: string }> = {
  'jordan-job-posting-maple-labs.txt': {
    content: `Senior Full Stack Developer | Maple Labs

Build accessible web products with TypeScript, React, Next.js, Node.js and PostgreSQL. Own features from database to UI, improve performance and mentor other engineers. Experience with event-driven systems is useful. Go is a plus.

About the company
Maple Labs is a fictional product team building collaboration tools for small businesses. This posting exists only to demonstrate Job Hunt.`,
  },
  'jordan-gaps-maple-labs.txt': {
    content:
      '- Go is a preferred skill in the posting but is not recorded in the sample career profile.\n',
  },
  'jordan-cover-letter-maple-labs.txt': { content: LETTER },
  'jordan-cover-letter-maple-labs.pdf': { document: '/demo/cover-letter.pdf' },
  'jordan-resume-maple-labs.pdf': { document: '/demo/resume.pdf' },
};

const RUNS: JobApplicationRun[] = [
  {
    id: 'demo-application',
    kind: RUN_KIND.JOB_APPLICATION,
    title: 'Maple Labs — Senior Full Stack Developer',
    status: RUN_STATUS.SUCCEEDED,
    startedAt: SAMPLE_DATE,
    finishedAt: '2026-10-20T10:02:00.000Z',
    output: `Illustrative run using fictional sample data; no live AI was called.

1. Read Jordan Rivera's career experience and resume.
2. Matched TypeScript, Next.js, Node.js and PostgreSQL experience to the posting.
3. Recorded Go as a gap rather than inventing experience.
4. Prepared a resume and cover letter, available in Applications.

Example application answer — Why this role?
I enjoy owning accessible web products end to end. My tracking and booking work combines the UI, API and database experience this role calls for.`,
  },
];

const entry = (name: string, folder = false): FileEntry => ({
  name,
  path: folder ? name : `${SAMPLE_FOLDER}/${name}`,
  created: SAMPLE_DATE,
  modified: SAMPLE_DATE,
  ...(folder
    ? { kind: FILE_ENTRY_KIND.FOLDER, itemCount: Object.keys(FILES).length }
    : {
        kind: FILE_ENTRY_KIND.FILE,
        size: Buffer.byteLength(FILES[name].content ?? ''),
      }),
});

const sampleNotFound = () =>
  NextResponse.json(
    { error: 'Sample not found' },
    { status: HTTP_STATUS_CODES.INVALID_PATH },
  );

const careerResponse = (kind: string | null) => {
  if (
    kind !== CAREER_FILE_KIND.RESUME &&
    kind !== CAREER_FILE_KIND.CAREER_EXPERIENCE
  ) {
    return sampleNotFound();
  }
  const isResume = kind === CAREER_FILE_KIND.RESUME;
  return NextResponse.json({
    content: isResume ? JSON.stringify(resume, null, 2) : careerExperience,
    path: isResume ? 'sample/resume.json' : 'sample/career-experience.md',
  });
};

const applicationsResponse = (path: string) => {
  if (!path)
    return NextResponse.json({ entries: [entry(SAMPLE_FOLDER, true)] });
  if (path === SAMPLE_FOLDER) {
    return NextResponse.json({
      entries: Object.keys(FILES).map(name => entry(name)),
    });
  }
  return sampleNotFound();
};

const fileResponse = (path: string, url: string) => {
  if (!path.startsWith(`${SAMPLE_FOLDER}/`)) return sampleNotFound();
  const name = path.slice(SAMPLE_FOLDER.length + 1);
  const file = Object.hasOwn(FILES, name) ? FILES[name] : undefined;
  if (file?.document) return NextResponse.redirect(new URL(file.document, url));
  if (file?.content)
    return new NextResponse(file.content, {
      headers: { [CONTENT_TYPE_HEADER]: 'text/plain; charset=utf-8' },
    });
  return sampleNotFound();
};

// Every API request is answered here in demo builds, before a filesystem,
// SQLite or Claude handler can run. Unknown paths fail closed as well.
export const demoResponse = (request: NextRequest): NextResponse => {
  if (request.method !== HTTP_METHOD.GET && request.method !== 'HEAD') {
    return NextResponse.json(
      { error: en.DEMO.READ_ONLY },
      { status: HTTP_STATUS_CODES.FORBIDDEN },
    );
  }
  const { pathname, searchParams } = request.nextUrl;
  const path = searchParams.get('path') ?? '';
  switch (pathname) {
    case API_ENDPOINTS.CAREER:
      return careerResponse(searchParams.get('kind'));
    case API_ENDPOINTS.JOB_APPLICATIONS_RUNS:
      return NextResponse.json({ runs: RUNS });
    case API_ENDPOINTS.JOB_APPLICATIONS:
      return applicationsResponse(path);
    case API_ENDPOINTS.JOB_APPLICATIONS_FILE:
      return fileResponse(path, request.url);
    default:
      return sampleNotFound();
  }
};
