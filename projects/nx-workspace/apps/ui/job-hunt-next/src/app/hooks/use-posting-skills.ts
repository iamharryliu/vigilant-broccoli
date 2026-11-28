'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { RUNS_TAB_URL } from '../app.const';
import {
  POSTING_SKILLS_CHANGED_EVENT,
  type PostingSkill,
} from '../constants/saved-postings';
import { useTranslation } from '../i18n';
import {
  fetchPostingSkills,
  startSkillSuggestions,
} from '../utils/saved-postings-storage.utils';

// The skills Claude suggested from the postings and the ones accepted into the
// matching; `suggest` starts the run that finds new suggestions.
export const usePostingSkills = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [skills, setSkills] = useState<PostingSkill[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    const reload = () => fetchPostingSkills().then(setSkills, () => undefined);
    reload();
    window.addEventListener(POSTING_SKILLS_CHANGED_EVENT, reload);
    return () =>
      window.removeEventListener(POSTING_SKILLS_CHANGED_EVENT, reload);
  }, []);

  const update = (request: Promise<PostingSkill[]>) =>
    request
      .then(setSkills)
      .catch(() => toast.error(t('JOB_POSTINGS.SAVE_FAILED')));

  const suggest = async () => {
    setSuggesting(true);
    try {
      await startSkillSuggestions();
      toast.success(t('JOB_POSTINGS.SUGGEST_STARTED'), {
        action: {
          label: t('DIALOG.VIEW_PROGRESS'),
          onClick: () => router.push(RUNS_TAB_URL),
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('JOB_POSTINGS.SUGGEST_FAILED'),
      );
    } finally {
      setSuggesting(false);
    }
  };

  return { skills, update, suggest, suggesting };
};
