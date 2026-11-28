'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CAREER_FILE_KIND } from '../constants/career';
import { SAVED_POSTINGS_CHANGED_EVENT } from '../constants/saved-postings';
import {
  fetchSavedPostings,
  type SavedPosting,
} from '../utils/saved-postings-storage.utils';
import { matchPosting, parseOwnedSkills } from '../utils/posting-match.utils';

// The captured postings scored against the career file's skills; `matches` is
// empty until both have loaded.
export const usePostingMatches = () => {
  const [postings, setPostings] = useState<SavedPosting[]>([]);
  const [ownedSkills, setOwnedSkills] = useState<string[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const reload = () =>
      fetchSavedPostings()
        .then(setPostings)
        .catch(() => setLoadFailed(true));
    reload();
    window.addEventListener(SAVED_POSTINGS_CHANGED_EVENT, reload);
    return () =>
      window.removeEventListener(SAVED_POSTINGS_CHANGED_EVENT, reload);
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

  return { matches, postings, ownedSkills: ownedSkills ?? [], loadFailed };
};
