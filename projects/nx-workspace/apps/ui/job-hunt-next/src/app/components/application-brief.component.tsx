'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '../i18n';
import type { Brief } from '../utils/job-application-files.utils';

export const SECTION_HEADING_CLASS =
  'text-xs font-medium uppercase tracking-wide text-muted-foreground';

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5 text-sm">
    {items.map(item => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const BriefSection = ({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-1">
    <h3 className={SECTION_HEADING_CLASS}>{heading}</h3>
    {children}
  </section>
);

const ListSection = ({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) =>
  items.length ? (
    <BriefSection heading={heading}>
      <BulletList items={items} />
    </BriefSection>
  ) : null;

export const BriefView = ({ brief }: { brief: Brief }) => {
  const { t } = useTranslation();
  const details = [
    [t('BRIEF.LEVEL'), brief.roleDetails.level],
    [t('BRIEF.LOCATION'), brief.roleDetails.location],
    [t('BRIEF.WORK_MODE'), brief.roleDetails.workMode],
    [t('BRIEF.COMPENSATION'), brief.roleDetails.compensation],
  ].filter(([, value]) => value);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {brief.summary && (
        <BriefSection heading={t('BRIEF.SUMMARY')}>
          <p className="whitespace-pre-wrap text-sm">{brief.summary}</p>
        </BriefSection>
      )}
      {details.length > 0 && (
        <BriefSection heading={t('BRIEF.ROLE_DETAILS')}>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </BriefSection>
      )}
      <ListSection
        heading={t('BRIEF.RESPONSIBILITIES')}
        items={brief.responsibilities}
      />
      <ListSection heading={t('BRIEF.REQUIRED')} items={brief.required} />
      <ListSection heading={t('BRIEF.NICE_TO_HAVE')} items={brief.niceToHave} />
      {brief.stack.length > 0 && (
        <BriefSection heading={t('BRIEF.STACK')}>
          <ul className="flex flex-wrap gap-2">
            {brief.stack.map(item => (
              <li
                key={item}
                className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {item}
              </li>
            ))}
          </ul>
        </BriefSection>
      )}
      <BriefSection heading={t('BRIEF.GAPS')}>
        {brief.gaps.length ? (
          <BulletList items={brief.gaps} />
        ) : (
          <p className="text-sm">{t('APPLICATIONS.NO_GAPS')}</p>
        )}
      </BriefSection>
      <ListSection heading={t('BRIEF.RED_FLAGS')} items={brief.redFlags} />
      <ListSection heading={t('BRIEF.QUESTIONS')} items={brief.questions} />
    </div>
  );
};
