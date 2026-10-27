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

interface DemoFile {
  content?: string;
  document?: string;
}

interface DemoApplication {
  folder: string;
  date: string;
  files: Record<string, DemoFile>;
}

const MAPLE_LETTER = `Dear Maple Labs hiring team,

I am applying for the Senior Full Stack Developer role. At Northwind Logistics, I led a Next.js and TypeScript tracking app rebuild with a component library shared by three teams. I also replaced polling with Kafka events and GraphQL subscriptions, bringing shipment updates to under five seconds.

Your focus on accessible products matches my work at Brightpath Health, where I led a WCAG 2.1 AA audit and fixed more than 120 issues. I would bring that same care for usability and reliable delivery to Maple Labs.

I would welcome the opportunity to discuss your team and its products.

Kind regards,
Jordan Rivera`;

const HARBORLINE_LETTER = `Dear Harborline Software hiring team,

I am applying for the Staff Frontend Engineer role. At Northwind Logistics, I led the Next.js and TypeScript rebuild of a tracking app and the shared component library that three teams now build on, with Tailwind CSS and Playwright end-to-end coverage.

At Brightpath Health, I led a WCAG 2.1 AA audit and fixed more than 120 issues, so design-system accessibility is work I have done rather than only read about.

I would welcome the chance to talk about how Harborline's design system could grow.

Kind regards,
Jordan Rivera`;

const TIDEWATER_LETTER = `Dear Tidewater Health hiring team,

I am applying for the Full Stack Engineer role. At Brightpath Health, I built Node.js, Express and PostgreSQL services behind a patient booking app and handled the privacy and audit requirements that come with health data.

I also worked with Docker, AWS and GitHub Actions to ship those services, and I enjoy mentoring teammates through code review.

I would welcome the opportunity to discuss how I could help Tidewater Health's care teams.

Kind regards,
Jordan Rivera`;

const LUMEN_LETTER = `Dear Lumen Analytics hiring team,

I am applying for the Senior Backend Engineer role. At Northwind Logistics, I built NestJS services with Kafka, Redis and PostgreSQL, and managed AWS infrastructure with Terraform and Kubernetes.

I have used Python at Brightpath Health for reporting jobs, though Java is not part of my recent work and I would be upfront about ramping up there.

Thank you for considering my application.

Kind regards,
Jordan Rivera`;

const posting = (
  title: string,
  company: string,
  body: string,
) => `${title} | ${company}

${body}

About the company
${company} is a fictional company. This posting exists only to demonstrate Job Hunt.`;

const APPLICATIONS: DemoApplication[] = [
  {
    folder: '2026-10-20-Maple-Labs-Senior-Full-Stack-Developer',
    date: '2026-10-20T10:00:00.000Z',
    files: {
      'jordan-job-posting-maple-labs.txt': {
        content: posting(
          'Senior Full Stack Developer',
          'Maple Labs',
          'Build accessible web products with TypeScript, React, Next.js, Node.js and PostgreSQL. Own features from database to UI, improve performance and mentor other engineers. Experience with event-driven systems is useful. Go is a plus.',
        ),
      },
      'jordan-gaps-maple-labs.txt': {
        content:
          '- Go is a preferred skill in the posting but is not recorded in the sample career profile.\n',
      },
      'jordan-cover-letter-maple-labs.txt': { content: MAPLE_LETTER },
      'jordan-cover-letter-maple-labs.pdf': {
        document: '/demo/cover-letter.pdf',
      },
      'jordan-resume-maple-labs.pdf': { document: '/demo/resume.pdf' },
    },
  },
  {
    folder: '2026-10-14-Harborline-Software-Staff-Frontend-Engineer',
    date: '2026-10-14T15:30:00.000Z',
    files: {
      'jordan-job-posting-harborline-software.txt': {
        content: posting(
          'Staff Frontend Engineer',
          'Harborline Software',
          'Lead the frontend architecture of a design system used by several product teams. You will work in React, TypeScript and Next.js, set accessibility and testing standards, and mentor senior engineers. Experience with Storybook and Vue is a plus.',
        ),
      },
      'jordan-gaps-harborline-software.txt': {
        content:
          '- Storybook is preferred in the posting but is not recorded in the sample career profile.\n- Vue is listed as a plus but is not recorded in the sample career profile.\n',
      },
      'jordan-cover-letter-harborline-software.txt': {
        content: HARBORLINE_LETTER,
      },
    },
  },
  {
    folder: '2026-10-08-Tidewater-Health-Full-Stack-Engineer',
    date: '2026-10-08T09:15:00.000Z',
    files: {
      'jordan-job-posting-tidewater-health.txt': {
        content: posting(
          'Full Stack Engineer',
          'Tidewater Health',
          'Build patient scheduling and messaging tools with React, Node.js and PostgreSQL. You will care about privacy, audit trails and reliable releases on AWS. Prior health-tech experience is welcome.',
        ),
      },
      'jordan-gaps-tidewater-health.txt': {
        content:
          'No gaps found: every required skill is in the career profile.\n',
      },
      'jordan-cover-letter-tidewater-health.txt': { content: TIDEWATER_LETTER },
    },
  },
  {
    folder: '2026-09-30-Lumen-Analytics-Senior-Backend-Engineer',
    date: '2026-09-30T13:45:00.000Z',
    files: {
      'jordan-job-posting-lumen-analytics.txt': {
        content: posting(
          'Senior Backend Engineer',
          'Lumen Analytics',
          'Design event-driven data services in Java or Kotlin on Kafka and PostgreSQL, deployed to Kubernetes on AWS. You will own services in production and improve observability.',
        ),
      },
      'jordan-gaps-lumen-analytics.txt': {
        content:
          '- Java is a required skill in the posting but is not recorded in the sample career profile.\n- Kotlin is a required alternative to Java and is not recorded in the sample career profile.\n- Observability tooling such as Prometheus or Grafana is not recorded in the sample career profile.\n',
      },
      'jordan-cover-letter-lumen-analytics.txt': { content: LUMEN_LETTER },
    },
  },
];

const IMPORT_DATE = '2026-10-18T08:30:00.000Z';

const RUNS: JobApplicationRun[] = [
  {
    id: 'demo-application',
    kind: RUN_KIND.JOB_APPLICATION,
    title: 'Maple Labs — Senior Full Stack Developer',
    status: RUN_STATUS.SUCCEEDED,
    startedAt: '2026-10-20T10:00:00.000Z',
    finishedAt: '2026-10-20T10:02:00.000Z',
    output: `Illustrative run using fictional sample data; no live AI was called.

1. Read Jordan Rivera's career experience and resume.
2. Matched TypeScript, Next.js, Node.js and PostgreSQL experience to the posting.
3. Recorded Go as a gap rather than inventing experience.
4. Prepared a resume and cover letter, available in Applications.

Example application answer — Why this role?
I enjoy owning accessible web products end to end. My tracking and booking work combines the UI, API and database experience this role calls for.`,
  },
  {
    id: 'demo-application-harborline',
    kind: RUN_KIND.JOB_APPLICATION,
    title: 'Harborline Software — Staff Frontend Engineer',
    status: RUN_STATUS.SUCCEEDED,
    startedAt: '2026-10-14T15:30:00.000Z',
    finishedAt: '2026-10-14T15:33:00.000Z',
    output: `Illustrative run using fictional sample data; no live AI was called.

1. Read Jordan Rivera's career experience and resume.
2. Matched React, TypeScript, Next.js, Tailwind CSS and the WCAG audit to the posting.
3. Recorded Storybook and Vue as gaps rather than inventing experience.
4. Wrote a cover letter that leads with the shared component library.`,
  },
  {
    id: 'demo-application-tidewater',
    kind: RUN_KIND.JOB_APPLICATION,
    title: 'Tidewater Health — Full Stack Engineer',
    status: RUN_STATUS.SUCCEEDED,
    startedAt: '2026-10-08T09:15:00.000Z',
    finishedAt: '2026-10-08T09:17:00.000Z',
    output: `Illustrative run using fictional sample data; no live AI was called.

1. Read Jordan Rivera's career experience and resume.
2. Matched Node.js, Express, PostgreSQL, AWS and health-data experience to the posting.
3. Found no gaps.
4. Wrote a cover letter that leads with the Brightpath Health booking services.`,
  },
  {
    id: 'demo-application-lumen',
    kind: RUN_KIND.JOB_APPLICATION,
    title: 'Lumen Analytics — Senior Backend Engineer',
    status: RUN_STATUS.FAILED,
    startedAt: '2026-09-30T13:45:00.000Z',
    finishedAt: '2026-09-30T13:46:00.000Z',
    output: `Illustrative run using fictional sample data; no live AI was called.

1. Read Jordan Rivera's career experience and resume.
2. Matched Kafka, PostgreSQL, Kubernetes and AWS experience to the posting.
3. Recorded Java, Kotlin and observability tooling as gaps.
Run stopped: the posting's required language is not in the career profile, so the cover letter was left as a draft for review.`,
  },
  {
    id: 'demo-career-import',
    kind: RUN_KIND.CAREER_EXPERIENCE_IMPORT,
    title: 'Career experience import',
    status: RUN_STATUS.SUCCEEDED,
    startedAt: IMPORT_DATE,
    finishedAt: '2026-10-18T08:31:00.000Z',
    output: `Illustrative run using fictional sample data; no live AI was called.

Read a pasted work history and rewrote career-experience.md with a skills table, three roles and quantified accomplishments.`,
  },
  {
    id: 'demo-resume-import',
    kind: RUN_KIND.RESUME_IMPORT,
    title: 'Resume import',
    status: RUN_STATUS.SUCCEEDED,
    startedAt: '2026-10-18T08:35:00.000Z',
    finishedAt: '2026-10-18T08:36:00.000Z',
    output: `Illustrative run using fictional sample data; no live AI was called.

Converted an uploaded resume into resume.json: basics, three work entries, education and skills.`,
  },
];

const findApplication = (folder: string) =>
  APPLICATIONS.find(application => application.folder === folder);

const folderEntry = ({ folder, date, files }: DemoApplication): FileEntry => ({
  name: folder,
  path: folder,
  created: date,
  modified: date,
  kind: FILE_ENTRY_KIND.FOLDER,
  itemCount: Object.keys(files).length,
});

const fileEntry = (
  { folder, date, files }: DemoApplication,
  name: string,
): FileEntry => ({
  name,
  path: `${folder}/${name}`,
  created: date,
  modified: date,
  kind: FILE_ENTRY_KIND.FILE,
  size: Buffer.byteLength(files[name].content ?? ''),
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
    return NextResponse.json({ entries: APPLICATIONS.map(folderEntry) });
  const application = findApplication(path);
  if (!application) return sampleNotFound();
  return NextResponse.json({
    entries: Object.keys(application.files).map(name =>
      fileEntry(application, name),
    ),
  });
};

const fileResponse = (path: string, url: string) => {
  const [folder, name] = path.split('/');
  const files = findApplication(folder)?.files ?? {};
  const file = name && Object.hasOwn(files, name) ? files[name] : undefined;
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
