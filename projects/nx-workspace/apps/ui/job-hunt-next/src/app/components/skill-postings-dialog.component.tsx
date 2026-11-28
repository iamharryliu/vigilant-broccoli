'use client';

import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { MATCH_LEVEL, type JobMatch } from '../utils/posting-match.utils';

export type SkillPostings = { skill: string; matches: JobMatch[] };

export const SKILL_BADGE_BUTTON_CLASS = 'cursor-pointer hover:underline';

export const SkillPostingsDialog = ({
  selection,
  onClose,
}: {
  selection: SkillPostings | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={!!selection} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {t('JOB_POSTINGS.SKILL_POSTINGS_TITLE', {
              name: selection?.skill ?? '',
            })}
          </DialogTitle>
          <DialogDescription>
            {t('JOB_POSTINGS.SKILL_POSTINGS_DESCRIPTION', {
              count: String(selection?.matches.length ?? 0),
            })}
          </DialogDescription>
        </DialogHeader>
        <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {selection?.matches.map(match => (
            <li
              key={match.url}
              className="flex items-start justify-between gap-2"
            >
              <div className="flex min-w-0 flex-col">
                <a
                  href={match.url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm font-medium underline-offset-2 hover:underline"
                >
                  {match.role}
                </a>
                {match.company && (
                  <span className="truncate text-xs text-muted-foreground">
                    {match.company}
                  </span>
                )}
              </div>
              {match.level !== MATCH_LEVEL.UNKNOWN && (
                <Badge color="gray" variant="soft" size="1">
                  {Math.round(match.ratio * 100)}%
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};
