'use client';

import { Check, X } from 'lucide-react';
import { Badge } from '@vigilant-broccoli/react-lib';
import {
  POSTING_SKILL_STATUS,
  type PostingSkill,
} from '../constants/saved-postings';
import { useTranslation } from '../i18n';
import { SECTION_HEADING_CLASS } from './application-brief.component';
import { SKILL_BADGE_BUTTON_CLASS } from './skill-postings-dialog.component';

const ICON_BUTTON_CLASS = 'text-muted-foreground hover:text-foreground';

type PostingSkillsPanelProps = {
  skills: PostingSkill[];
  onAccept: (name: string) => void;
  onDismiss: (name: string) => void;
  onRemove: (name: string) => void;
  onSelect: (skill: PostingSkill) => void;
};

// Skills Claude found in the postings that the built-in vocabulary lacks:
// accepting one makes it count as a match or a gap in every posting.
export const PostingSkillsPanel = ({
  skills,
  onAccept,
  onDismiss,
  onRemove,
  onSelect,
}: PostingSkillsPanelProps) => {
  const { t } = useTranslation();
  const suggested = skills.filter(
    skill => skill.status === POSTING_SKILL_STATUS.SUGGESTED,
  );
  const accepted = skills.filter(
    skill => skill.status === POSTING_SKILL_STATUS.ACCEPTED,
  );
  if (!suggested.length && !accepted.length) return null;

  return (
    <section className="flex shrink-0 flex-col gap-2">
      {suggested.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className={SECTION_HEADING_CLASS}>
            {t('JOB_POSTINGS.SUGGESTED')}
          </h2>
          <div className="flex flex-wrap gap-1">
            {suggested.map(skill => (
              <Badge key={skill.name} color="purple" variant="soft" size="1">
                <button
                  type="button"
                  onClick={() => onSelect(skill)}
                  className={SKILL_BADGE_BUTTON_CLASS}
                >
                  {skill.name}
                  {skill.postings > 0 && ` × ${skill.postings}`}
                </button>
                <button
                  type="button"
                  aria-label={t('JOB_POSTINGS.ADD_SKILL', { name: skill.name })}
                  onClick={() => onAccept(skill.name)}
                  className={ICON_BUTTON_CLASS}
                >
                  <Check className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label={t('JOB_POSTINGS.DISMISS_SKILL', {
                    name: skill.name,
                  })}
                  onClick={() => onDismiss(skill.name)}
                  className={ICON_BUTTON_CLASS}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      {accepted.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className={SECTION_HEADING_CLASS}>
            {t('JOB_POSTINGS.ADDED_SKILLS')}
          </h2>
          <div className="flex flex-wrap gap-1">
            {accepted.map(skill => (
              <Badge key={skill.name} color="gray" variant="outline" size="1">
                {skill.name}
                <button
                  type="button"
                  aria-label={t('JOB_POSTINGS.REMOVE_SKILL', {
                    name: skill.name,
                  })}
                  onClick={() => onRemove(skill.name)}
                  className={ICON_BUTTON_CLASS}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
