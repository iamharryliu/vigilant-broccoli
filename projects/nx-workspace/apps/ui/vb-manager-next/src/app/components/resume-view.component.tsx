import { Fragment, ReactNode } from 'react';
import { Roboto } from 'next/font/google';
import { ResumeData, ResumeWorkExperience } from '@vigilant-broccoli/resume';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
});

const LINK_COLOR_CLASS = 'text-[#1155cc]';
const HEADING_COLOR_CLASS = 'text-[#3d85c6]';

const BOLD_PATTERN = /\*\*(.+?)\*\*/g;

const renderInlineBold = (text: string): ReactNode => {
  const parts = text.split(BOLD_PATTERN);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index}>{part}</strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
};

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h2
    className={`text-[16px] font-bold border-b border-black pb-0.5 mb-1.5 ${HEADING_COLOR_CLASS}`}
  >
    {children}
  </h2>
);

const WorkExperienceEntry = ({ entry }: { entry: ResumeWorkExperience }) => (
  <div className="mb-2.5 last:mb-0">
    <div className="flex justify-between items-baseline gap-2">
      <span className="font-bold">
        {entry.company} - {entry.role}
      </span>
      <span className="whitespace-nowrap text-right">
        {entry.startDate} - {entry.endDate}
      </span>
    </div>
    <ul className="list-disc pl-5 mt-0.5 space-y-0.5">
      {entry.bullets.map((bullet, index) => (
        <li key={index}>{renderInlineBold(bullet)}</li>
      ))}
    </ul>
  </div>
);

export const ResumeViewComponent = ({ resume }: { resume: ResumeData }) => {
  const { basics, summary, workExperience, projectExperience, skills } = resume;

  return (
    <div
      className={`bg-white text-black text-[13px] leading-snug p-8 shadow-md print:shadow-none print:p-0 max-w-[850px] mx-auto print:max-w-none print:w-full ${roboto.className}`}
    >
      <div className="grid grid-cols-3 items-start mb-2">
        <div className="flex flex-col gap-0.5">
          {basics.links.map(link => (
            <a
              key={link.url}
              href={link.url}
              className={`underline ${LINK_COLOR_CLASS}`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{basics.name}</h1>
          <p className="font-bold text-[13px]">{basics.title}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <a
            href={`mailto:${basics.email}`}
            className={`underline ${LINK_COLOR_CLASS}`}
          >
            {basics.email}
          </a>
          <span>{basics.phone}</span>
        </div>
      </div>

      <p className="mb-2">{summary}</p>

      <section className="mb-2">
        <SectionHeading>Work Experience</SectionHeading>
        {workExperience.map((entry, index) => (
          <WorkExperienceEntry key={index} entry={entry} />
        ))}
      </section>

      <section className="mb-2">
        <SectionHeading>Project Experience</SectionHeading>
        {projectExperience.map((entry, index) => (
          <WorkExperienceEntry key={index} entry={entry} />
        ))}
      </section>

      <section className="mb-2">
        <SectionHeading>Skills</SectionHeading>
        <p>
          <span className="font-bold">Technical: </span>
          {skills.technical.join(', ')}.
        </p>
        <p className="font-bold">Soft:</p>
        <ul className="list-disc pl-5 space-y-0.5">
          {skills.soft.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
