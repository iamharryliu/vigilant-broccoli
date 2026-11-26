'use client';

import { useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { Badge, Button, CollapsibleList } from '@vigilant-broccoli/react-lib';
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
  [SWEDISH_REQUIREMENT.NOT_MENTIONED]: {
    color: 'gray',
    key: 'MATCHES.SWEDISH_NOT_MENTIONED',
  },
} as const satisfies Record<SwedishRequirement, { color: string; key: string }>;

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

  const swedish = SWEDISH_BADGE[brief.swedish];

  return (
    <div className="flex flex-col gap-2">
      {brief.summary && <p className="m-0 text-sm">{brief.summary}</p>}
      <div className="flex flex-wrap items-center gap-1">
        {[brief.level, brief.employmentType, brief.location, brief.workMode]
          .filter(Boolean)
          .map(chip => (
            <Badge key={chip} color="gray" variant="soft" size="1">
              {chip}
            </Badge>
          ))}
        <Badge color={swedish.color} variant="soft" size="1">
          {t(swedish.key)}
        </Badge>
      </div>
    </div>
  );
};

// Rendered at the bottom of the card, below the matched and gap skills.
export const MatchBriefDetails = ({
  brief,
  generating,
  onGenerate,
}: MatchBriefProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!brief) return null;

  const notStated = t('MATCHES.BRIEF_NOT_STATED');
  const details = [
    ['MATCHES.BRIEF_LEVEL', brief.level],
    ['MATCHES.BRIEF_LOCATION', brief.location],
    ['MATCHES.BRIEF_WORK_MODE', brief.workMode],
    ['MATCHES.BRIEF_EMPLOYMENT_TYPE', brief.employmentType],
    ['MATCHES.BRIEF_PAY', brief.compensation],
    ['MATCHES.BRIEF_WORK_PERMIT', brief.workAuthorization],
  ] as const;

  return (
    <div className="flex flex-col">
      <CollapsibleList
        triggerClassName="py-1"
        onOpenChange={(_, next) => setOpen(next)}
        items={[
          {
            id: 'brief',
            className: 'border-0',
            titleContent: (
              <span className="text-sm text-primary">
                {t(open ? 'MATCHES.BRIEF_HIDE' : 'MATCHES.BRIEF_SHOW')}
              </span>
            ),
            content: (
              <div className="grid gap-4 border-t border-border pt-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className={SECTION_HEADING_CLASS}>
                    {t('MATCHES.BRIEF_ROLE')}
                  </span>
                  <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0.5 text-sm">
                    {details.map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="text-muted-foreground">{t(key)}</dt>
                        <dd className="m-0">
                          {value || (
                            <span className="text-muted-foreground">
                              {notStated}
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
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
                {onGenerate && (
                  <Button
                    variant="outline"
                    className="self-start sm:col-span-2"
                    loading={generating}
                    onClick={onGenerate}
                  >
                    <RefreshCw size={ICON_SIZE} />
                    {t('MATCHES.BRIEF_REGENERATE')}
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
