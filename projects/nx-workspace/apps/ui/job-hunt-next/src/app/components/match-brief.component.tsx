'use client';

import { FileText, Info } from 'lucide-react';
import { Badge, Button, CollapsibleCard } from '@vigilant-broccoli/react-lib';
import {
  SWEDISH_REQUIREMENT,
  type MatchBrief,
  type SwedishRequirement,
} from '../constants/matches';
import { useTranslation } from '../i18n';
import { SECTION_HEADING_CLASS } from './application-brief.component';

const ICON_SIZE = 14;

const SWEDISH_BADGE = {
  [SWEDISH_REQUIREMENT.REQUIRED]: {
    color: 'orange',
    key: 'MATCHES.SWEDISH_REQUIRED',
  },
  [SWEDISH_REQUIREMENT.PREFERRED]: {
    color: 'amber',
    key: 'MATCHES.SWEDISH_PREFERRED',
  },
} as const satisfies Partial<
  Record<SwedishRequirement, { color: string; key: string }>
>;

// Blocks sit in a `-mx-3` row so the tint bleeds past the card's padding and
// the text inside stays aligned with the rest of the card instead of narrowing.
export const BLOCK_CLASS = 'rounded-md border border-border bg-muted p-3';

const DetailList = ({
  rows,
  badges = false,
}: {
  rows: readonly (readonly [string, string])[];
  badges?: boolean;
}) => (
  <dl
    className={`m-0 grid grid-cols-[max-content_1fr] gap-x-3 text-sm ${badges ? 'items-center gap-y-1' : 'gap-y-0.5'}`}
  >
    {rows
      .filter(([, value]) => value)
      .map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="m-0">
            {badges ? (
              <Badge
                color="blue"
                variant="soft"
                size="1"
                className="whitespace-normal"
              >
                {value}
              </Badge>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
  </dl>
);

const BriefList = ({ title, items }: { title: string; items: string[] }) =>
  items.length > 0 && (
    <div className="flex flex-col gap-1">
      <span className={SECTION_HEADING_CLASS}>{title}</span>
      <ul className="list-disc pl-5 text-sm">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );

type MatchBriefProps = {
  brief: MatchBrief | null;
  generating: boolean;
  // Absent when briefs cannot be generated (the demo build).
  onGenerate?: () => void;
};

// The one-line summary and chips stay on the card; the rest opens on demand in
// `MatchBriefDetails`.
export const MatchBriefSummary = ({
  brief,
  generating,
  onGenerate,
}: MatchBriefProps) => {
  const { t } = useTranslation();

  if (!brief) {
    return (
      onGenerate && (
        <Button
          variant="outline"
          className="self-start"
          loading={generating}
          onClick={onGenerate}
        >
          <FileText size={ICON_SIZE} />
          {t(
            generating ? 'MATCHES.BRIEF_GENERATING' : 'MATCHES.BRIEF_GENERATE',
          )}
        </Button>
      )
    );
  }

  const swedish =
    brief.swedish === SWEDISH_REQUIREMENT.NOT_MENTIONED
      ? null
      : SWEDISH_BADGE[brief.swedish];

  return (
    <div className={`-mx-3 flex flex-col gap-2 ${BLOCK_CLASS}`}>
      <span className={SECTION_HEADING_CLASS}>
        {t('MATCHES.BRIEF_SUMMARY')}
      </span>
      {brief.summary && <p className="m-0 text-sm">{brief.summary}</p>}
      <DetailList
        badges
        rows={[
          [t('MATCHES.BRIEF_LEVEL'), brief.level],
          [t('MATCHES.BRIEF_LOCATION'), brief.location],
          [t('MATCHES.BRIEF_WORK_MODE'), brief.workMode],
          [t('MATCHES.BRIEF_EMPLOYMENT_TYPE'), brief.employmentType],
        ]}
      />
      {swedish && (
        <Badge
          className="self-start"
          color={swedish.color}
          variant="soft"
          size="1"
        >
          {t(swedish.key)}
        </Badge>
      )}
    </div>
  );
};

// Rendered at the bottom of the card, below the matched and gap skills.
export const MatchBriefDetails = ({
  brief,
}: Pick<MatchBriefProps, 'brief'>) => {
  const { t } = useTranslation();
  if (!brief) return null;

  const details = [
    [t('MATCHES.BRIEF_PAY'), brief.compensation],
    [t('MATCHES.BRIEF_WORK_PERMIT'), brief.workAuthorization],
  ] as const;

  return (
    <div className="-mx-3">
      <CollapsibleCard
        title={
          <span className="flex items-center gap-1.5 text-sm text-primary">
            {t('MATCHES.BRIEF_POSTING')}
            <Info size={ICON_SIZE} />
          </span>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {details.some(([, value]) => value) && (
            <div className="flex flex-col gap-1">
              <span className={SECTION_HEADING_CLASS}>
                {t('MATCHES.BRIEF_ROLE')}
              </span>
              <DetailList rows={details} />
            </div>
          )}
          <BriefList
            title={t('MATCHES.BRIEF_RESPONSIBILITIES')}
            items={brief.responsibilities}
          />
          <BriefList
            title={t('MATCHES.BRIEF_MUST_HAVE')}
            items={brief.mustHave}
          />
          <BriefList
            title={t('MATCHES.BRIEF_NICE_TO_HAVE')}
            items={brief.niceToHave}
          />
          <BriefList
            title={t('MATCHES.BRIEF_RED_FLAGS')}
            items={brief.redFlags}
          />
          {brief.abbreviations.length > 0 && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <span className={SECTION_HEADING_CLASS}>
                {t('MATCHES.BRIEF_ABBREVIATIONS')}
              </span>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-1 pr-4 font-medium">
                      {t('MATCHES.BRIEF_TERM')}
                    </th>
                    <th className="py-1 font-medium">
                      {t('MATCHES.BRIEF_MEANING')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brief.abbreviations.map(({ term, meaning }) => (
                    <tr
                      key={term}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-1 pr-4 font-medium">{term}</td>
                      <td className="py-1">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CollapsibleCard>
    </div>
  );
};
