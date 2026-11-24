'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CAREER_FILE_KIND } from '../constants/career';
import { JOB_MATCHES_CHANGED_EVENT } from '../constants/matches';
import {
  fetchMatchPostings,
  type StoredMatchPosting,
} from '../utils/job-matches-storage.utils';
import { matchPosting, parseOwnedSkills } from '../utils/job-matches.utils';

// The captured postings scored against the career file's skills; `matches` is
// empty until both have loaded.
export const useSkillMatches = () => {
  const [postings, setPostings] = useState<StoredMatchPosting[]>([]);
  const [ownedSkills, setOwnedSkills] = useState<string[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const reload = () =>
      fetchMatchPostings()
        .then(setPostings)
        .catch(() => setLoadFailed(true));
    reload();
    window.addEventListener(JOB_MATCHES_CHANGED_EVENT, reload);
    return () => window.removeEventListener(JOB_MATCHES_CHANGED_EVENT, reload);
  }, []);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.CAREER}?kind=${CAREER_FILE_KIND.CAREER_EXPERIENCE}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => setOwnedSkills(parseOwnedSkills(data.content)))
      .catch(() => setLoadFailed(true));
  }, []);

  const matches = useMemo(
    () =>
      ownedSkills
        ? postings.map(posting => matchPosting(posting, ownedSkills))
        : [],
    [postings, ownedSkills],
  );

  return { matches, ownedSkills: ownedSkills ?? [], loadFailed };
};
