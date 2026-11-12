'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, X } from 'lucide-react';
import type { StoredJobMatchesPosting } from '@vigilant-broccoli/common-js';
import { Badge, Button, Card, Select } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { RUNS_TAB_URL } from '../app.const';
import { CAREER_FILE_KIND } from '../constants/career';
import { IS_DEMO } from '../constants/demo';
import {
  JOB_MATCH_SKILLS_CHANGED_EVENT,
  JOB_MATCHES_CHANGED_EVENT,
  JOB_MATCHES_PROGRESS_EVENT,
  MATCH_SKILL_STATUS,
  type MatchSkill,
} from '../constants/matches';
import { useTranslation } from '../i18n';
import { getMatchesProgress } from '../utils/job-matches-progress.utils';
import {
  fetchMatchPostings,
  fetchMatchSkills,
  removeMatchPostings,
  removeMatchSkill,
  setMatchSkillStatus,
  startSkillSuggestions,
} from '../utils/job-matches-storage.utils';
import {
  MATCH_LEVEL,
  SORT_OPTION,
  type JobMatch,
  type MatchLevel,
  type SortOption,
  countGaps,
  matchPosting,
  parseOwnedSkills,
  sortMatches,
} from '../utils/job-matches.utils';
import { SECTION_HEADING_CLASS } from './application-brief.component';
import { JobMatchSkillsPanel } from './job-match-skills-panel.component';

const TOP_GAP_COUNT = 12;
const SORT_STORAGE_KEY = 'job-hunt-matches-sort';

const LEVEL_BADGE = {
  [MATCH_LEVEL.STRONG]: { color: 'green', key: 'MATCHES.STRONG' },
  [MATCH_LEVEL.OKAY]: { color: 'amber', key: 'MATCHES.OKAY' },
  [MATCH_LEVEL.WEAK]: { color: 'red', key: 'MATCHES.WEAK' },
  [MATCH_LEVEL.UNKNOWN]: { color: 'gray', key: 'MATCHES.UNKNOWN' },
} as const satisfies Record<MatchLevel, { color: string; key: string }>;

const MatchCard = ({
  match,
  onRemove,
}: {
  match: JobMatch;
  onRemove: () => void;
}) => {
  const { t } = useTranslation();
  const badge = LEVEL_BADGE[match.level];
  return (
    <Card className="flex shrink-0 flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <a
            href={match.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-medium underline-offset-2 hover:underline"
          >
            {match.role}
          </a>
          {(match.company || match.postedAt) && (
            <span className="truncate text-xs text-muted-foreground">
              {[
                match.company,
                match.postedAt &&
                  t('MATCHES.POSTED', {
                    date: new Date(match.postedAt).toLocaleDateString(
                      undefined,
                      { month: 'short', day: 'numeric' },
                    ),
                  }),
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge color={badge.color} variant="soft" size="1">
            {t(badge.key)}
            {match.level !== MATCH_LEVEL.UNKNOWN &&
              ` · ${Math.round(match.ratio * 100)}%`}
          </Badge>
          <button
            type="button"
            aria-label={t('MATCHES.REMOVE')}
            onClick={onRemove}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      {match.matched.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className={SECTION_HEADING_CLASS}>{t('MATCHES.MATCHED')}</span>
          {match.matched.map(skill => (
            <Badge key={skill} color="green" variant="soft" size="1">
              {skill}
            </Badge>
          ))}
        </div>
      )}
      {match.gaps.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className={SECTION_HEADING_CLASS}>{t('MATCHES.GAPS')}</span>
          {match.gaps.map(skill => (
            <Badge key={skill} color="orange" variant="outline" size="1">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};

export const JobMatchesPage = () => {
  const { t } = useTranslation();
  const [postings, setPostings] = useState<StoredJobMatchesPosting[]>([]);
  const [ownedSkills, setOwnedSkills] = useState<string[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [progress, setProgress] = useState(getMatchesProgress);
  const [skills, setSkills] = useState<MatchSkill[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SortOption>(
    SORT_OPTION.BEST_MATCH,
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SORT_STORAGE_KEY);
      const saved = Object.values(SORT_OPTION).find(
        option => option === stored,
      );
      if (saved) setSortOption(saved);
    } catch {
      // Blocked storage: the default order applies.
    }
  }, []);

  const changeSort = (option: SortOption) => {
    setSortOption(option);
    try {
      localStorage.setItem(SORT_STORAGE_KEY, option);
    } catch {
      // Blocked storage: the choice lasts until reload.
    }
  };

  useEffect(() => {
    const update = () => setProgress(getMatchesProgress());
    update();
    window.addEventListener(JOB_MATCHES_PROGRESS_EVENT, update);
    return () => window.removeEventListener(JOB_MATCHES_PROGRESS_EVENT, update);
  }, []);

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

  useEffect(() => {
    const reload = () => fetchMatchSkills().then(setSkills, () => undefined);
    reload();
    window.addEventListener(JOB_MATCH_SKILLS_CHANGED_EVENT, reload);
    return () =>
      window.removeEventListener(JOB_MATCH_SKILLS_CHANGED_EVENT, reload);
  }, []);

  const updateSkills = (request: Promise<MatchSkill[]>) =>
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

  const remove = (url?: string) =>
    removeMatchPostings(url)
      .then(setPostings)
      .catch(() => toast.error(t('MATCHES.SAVE_FAILED')));

  const customTerms = useMemo(
    () => skills.filter(skill => skill.status === MATCH_SKILL_STATUS.ACCEPTED),
    [skills],
  );
  const matches = useMemo(
    () =>
      ownedSkills
        ? sortMatches(
            postings.map(posting =>
              matchPosting(posting, ownedSkills, customTerms),
            ),
            sortOption,
          )
        : [],
    [postings, ownedSkills, customTerms, sortOption],
  );
  const topGaps = useMemo(
    () => countGaps(matches).slice(0, TOP_GAP_COUNT),
    [matches],
  );

  return (
    <div className="flex flex-col gap-3">
      {progress && (
        <div className="flex shrink-0 items-center gap-2 rounded-md bg-muted p-3 text-sm">
          <Loader2 className="size-4 animate-spin" />
          {t('MATCHES.CAPTURING', {
            captured: String(progress.captured),
            seen: String(progress.seen),
          })}
        </div>
      )}
      {matches.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm">
            {t('MATCHES.COUNT', { count: String(matches.length) })}
          </span>
          <div className="flex items-center gap-2">
            <Select
              aria-label={t('MATCHES.SORT')}
              options={Object.values(SORT_OPTION)}
              value={sortOption}
              onValueChange={changeSort}
              displayMapper={{
                [SORT_OPTION.BEST_MATCH]: t('MATCHES.SORT_BEST_MATCH'),
                [SORT_OPTION.FEWEST_GAPS]: t('MATCHES.SORT_FEWEST_GAPS'),
                [SORT_OPTION.MOST_MATCHED]: t('MATCHES.SORT_MOST_MATCHED'),
                [SORT_OPTION.POSTED]: t('MATCHES.SORT_POSTED'),
                [SORT_OPTION.NEWEST]: t('MATCHES.SORT_NEWEST'),
                [SORT_OPTION.ROLE]: t('MATCHES.SORT_ROLE'),
                [SORT_OPTION.COMPANY]: t('MATCHES.SORT_COMPANY'),
              }}
            />
            <Button
              variant="outline"
              loading={suggesting}
              disabled={IS_DEMO}
              onClick={suggest}
            >
              <Sparkles />
              {t('MATCHES.SUGGEST')}
            </Button>
            <Button variant="outline" onClick={() => remove()}>
              {t('MATCHES.CLEAR')}
            </Button>
          </div>
        </div>
      )}
      {loadFailed && (
        <p className="text-sm text-destructive">{t('MATCHES.LOAD_FAILED')}</p>
      )}
      {!loadFailed && ownedSkills?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('MATCHES.NO_SKILLS')}
        </p>
      )}
      {matches.length === 0 && !loadFailed && !progress && (
        <p className="text-sm text-muted-foreground">{t('MATCHES.EMPTY')}</p>
      )}
      <JobMatchSkillsPanel
        skills={skills}
        onAccept={name =>
          updateSkills(setMatchSkillStatus(name, MATCH_SKILL_STATUS.ACCEPTED))
        }
        onDismiss={name =>
          updateSkills(setMatchSkillStatus(name, MATCH_SKILL_STATUS.DISMISSED))
        }
        onRemove={name => updateSkills(removeMatchSkill(name))}
      />
      {topGaps.length > 0 && (
        <section className="flex shrink-0 flex-col gap-1">
          <h2 className={SECTION_HEADING_CLASS}>{t('MATCHES.TOP_GAPS')}</h2>
          <div className="flex flex-wrap gap-1">
            {topGaps.map(([skill, count]) => (
              <Badge key={skill} color="orange" variant="outline" size="1">
                {skill} × {count}
              </Badge>
            ))}
          </div>
        </section>
      )}
      {matches.map(match => (
        <MatchCard
          key={match.url}
          match={match}
          onRemove={() => remove(match.url)}
        />
      ))}
    </div>
  );
};
