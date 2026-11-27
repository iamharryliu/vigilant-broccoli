'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { RUNS_TAB_URL } from '../app.const';
import {
  JOB_MATCH_SKILLS_CHANGED_EVENT,
  type MatchSkill,
} from '../constants/matches';
import { useTranslation } from '../i18n';
import {
  fetchMatchSkills,
  startSkillSuggestions,
} from '../utils/job-matches-storage.utils';

// The skills Claude suggested from the postings and the ones accepted into the
// matching; `suggest` starts the run that finds new suggestions.
export const useMatchSkills = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [skills, setSkills] = useState<MatchSkill[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    const reload = () => fetchMatchSkills().then(setSkills, () => undefined);
    reload();
    window.addEventListener(JOB_MATCH_SKILLS_CHANGED_EVENT, reload);
    return () =>
      window.removeEventListener(JOB_MATCH_SKILLS_CHANGED_EVENT, reload);
  }, []);

  const update = (request: Promise<MatchSkill[]>) =>
    request.then(setSkills).catch(() => toast.error(t('MATCHES.SAVE_FAILED')));

  const suggest = async () => {
    setSuggesting(true);
    try {
      await startSkillSuggestions();
      toast.success(t('MATCHES.SUGGEST_STARTED'), {
        action: {
          label: t('DIALOG.VIEW_PROGRESS'),
          onClick: () => router.push(RUNS_TAB_URL),
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('MATCHES.SUGGEST_FAILED'),
      );
    } finally {
      setSuggesting(false);
    }
  };

  return { skills, update, suggest, suggesting };
};
