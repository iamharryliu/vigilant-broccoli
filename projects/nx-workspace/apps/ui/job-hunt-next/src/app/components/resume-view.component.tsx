import { Fragment, ReactNode } from 'react';
import { ResumeData, ResumeWorkExperience } from '@vigilant-broccoli/resume';
import { useTranslation } from '../i18n';

const RESUME_FONT_FAMILY = "Roboto, 'Helvetica Neue', Arial, sans-serif";

const LINK_COLOR_CLASS = 'text-[#1155cc]';
const HEADING_COLOR_CLASS = 'text-[#3d85c6]';

const BOLD_PATTERN = /\*\*(.+?)\*\*/g;
const SKILL_SEPARATOR = ' · ';

const WEB_URL_PATTERN = /^https?:\/\/[^\s<>"]+$/i;
const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+$/;

// The resume is editable JSON, so a `javascript:` URL must not become a link.
const toSafeHref = (url: string) => (WEB_URL_PATTERN.test(url) ? url : null);

const toMailtoHref = (email: string) =>
  EMAIL_PATTERN.test(email) ? `mailto:${email}` : null;

const ResumeLink = ({
  href,
  children,
}: {
  href: string | null;
  children: ReactNode;
}) =>
  href ? (
    <a href={href} className={`underline ${LINK_COLOR_CLASS}`}>
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );

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
  const { t } = useTranslation();
  const { basics, summary, workExperience, projectExperience, skills } = resume;
  const trimmedSummary = summary?.trim();

  return (
    <div
      // eslint-disable-next-line vigilant-broccoli/require-dark-variant -- printable resume is intentionally white paper in both themes
      className="bg-white text-black text-[13px] leading-snug p-8 shadow-md print:shadow-none print:p-0 max-w-[850px] print:max-w-none print:w-full"
      style={{ fontFamily: RESUME_FONT_FAMILY }}
    >
      <div className="grid grid-cols-3 items-start mb-2">
        <div className="flex flex-col gap-0.5">
          {basics.links.map(link => (
            <ResumeLink key={link.url} href={toSafeHref(link.url)}>
              {link.label}
            </ResumeLink>
          ))}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{basics.name}</h1>
          <p className="font-bold text-[13px]">{basics.title}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <ResumeLink href={toMailtoHref(basics.email)}>
            {basics.email}
          </ResumeLink>
          <span>{basics.phone}</span>
        </div>
      </div>

      {trimmedSummary && (
        <p className="mb-2">{renderInlineBold(trimmedSummary)}</p>
      )}

      <section className="mb-2">
        <SectionHeading>{t('RESUME.WORK_EXPERIENCE')}</SectionHeading>
        {workExperience.map((entry, index) => (
          <WorkExperienceEntry key={index} entry={entry} />
        ))}
      </section>

      <section className="mb-2">
        <SectionHeading>{t('RESUME.OPEN_SOURCE')}</SectionHeading>
        {projectExperience.map((entry, index) => (
          <WorkExperienceEntry key={index} entry={entry} />
        ))}
      </section>

      <p className="mt-[18px] border-t border-black pt-1 text-center">
        {skills.technical.join(SKILL_SEPARATOR)}
      </p>
    </div>
  );
};
