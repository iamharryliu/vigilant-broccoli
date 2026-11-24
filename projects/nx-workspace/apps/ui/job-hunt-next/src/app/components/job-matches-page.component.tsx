'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  ArchiveRestore,
  ArrowUpDown,
  CheckCheck,
  Filter,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EllipsisCTA,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
} from '@vigilant-broccoli/react-lib';
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
import { isActiveRunStatus, RUN_KIND } from '../constants/runs';
import { useRuns } from '../hooks/use-runs';
import { useTranslation } from '../i18n';
import { getMatchesProgress } from '../utils/job-matches-progress.utils';
import {
  fetchMatchPostings,
  fetchMatchSkills,
  removeMatchPostings,
  removeMatchSkill,
  setMatchPostingArchived,
  setMatchSkillStatus,
  startMatchBrief,
  startSkillSuggestions,
  type StoredMatchPosting,
} from '../utils/job-matches-storage.utils';
import {
  LEVEL_FILTER_ALL,
  MATCH_LEVEL,
  SORT_OPTION,
  type JobMatch,
  type LevelFilter,
  type MatchLevel,
  type SortOption,
  countGaps,
  filterMatches,
  isInVocabulary,
  matchPosting,
  parseOwnedSkills,
  postingMentionsSkill,
  sortMatches,
} from '../utils/job-matches.utils';
import { SECTION_HEADING_CLASS } from './application-brief.component';
import { MatchFiltersDialog } from './match-filters-dialog.component';
import {
  SKILL_BADGE_BUTTON_CLASS,
  SkillPostingsDialog,
  type SkillPostings,
} from './skill-postings-dialog.component';
import { MatchBriefDetails, MatchBriefSummary } from './match-brief.component';
import { JobMatchSkillsPanel } from './job-match-skills-panel.component';

const TOP_GAP_COUNT = 12;
const SORT_STORAGE_KEY = 'job-hunt-matches-sort';
const LANGUAGES_STORAGE_KEY = 'job-hunt-matches-languages';

const LEVEL_BADGE = {
  [MATCH_LEVEL.STRONG]: { color: 'green', key: 'MATCHES.STRONG' },
  [MATCH_LEVEL.OKAY]: { color: 'amber', key: 'MATCHES.OKAY' },
  [MATCH_LEVEL.WEAK]: { color: 'red', key: 'MATCHES.WEAK' },
  [MATCH_LEVEL.UNKNOWN]: { color: 'gray', key: 'MATCHES.UNKNOWN' },
} as const satisfies Record<MatchLevel, { color: string; key: string }>;

const MatchCard = ({
  match,
  generating,
  onRemove,
  onArchive,
  onGenerateBrief,
}: {
  match: JobMatch;
  generating: boolean;
  onRemove: () => void;
  onArchive: (archived: boolean, applied: boolean) => void;
  onGenerateBrief?: () => void;
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
          {match.easyApply && (
            <Badge color="blue" variant="soft" size="1">
              {t('MATCHES.EASY_APPLY')}
            </Badge>
          )}
          <Badge color={badge.color} variant="soft" size="1">
            {t(badge.key)}
            {match.level !== MATCH_LEVEL.UNKNOWN &&
              ` · ${Math.round(match.ratio * 100)}%`}
          </Badge>
          {match.applied && (
            <Badge color="green" variant="solid" size="1">
              {t('MATCHES.APPLIED')}
            </Badge>
          )}
          <EllipsisCTA
            actions={[
              ...(match.applied
                ? []
                : [
                    {
                      label: t('MATCHES.MARK_APPLIED'),
                      icon: <CheckCheck size={16} />,
                      onSelect: () => onArchive(true, true),
                    },
                  ]),
              {
                label: match.archived
                  ? t('MATCHES.UNARCHIVE')
                  : t('MATCHES.ARCHIVE'),
                icon: match.archived ? (
                  <ArchiveRestore size={16} />
                ) : (
                  <Archive size={16} />
                ),
                onSelect: () => onArchive(!match.archived, false),
              },
              {
                label: t('MATCHES.REMOVE'),
                icon: <Trash2 size={16} />,
                color: 'red',
                onSelect: onRemove,
                confirm: {
                  title: t('MATCHES.REMOVE_TITLE'),
                  description: t('MATCHES.REMOVE_DESCRIPTION', {
                    role: match.role,
                  }),
                  confirmLabel: t('MATCHES.REMOVE'),
                },
              },
            ]}
          />
        </div>
      </div>
      <MatchBriefSummary
        brief={match.brief}
        generating={generating}
        onGenerate={onGenerateBrief}
      />
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
      <MatchBriefDetails
        brief={match.brief}
        generating={generating}
        onGenerate={onGenerateBrief}
      />
    </Card>
  );
};

export const JobMatchesPage = () => {
  const { t } = useTranslation();
  const [postings, setPostings] = useState<StoredMatchPosting[]>([]);
  const [ownedSkills, setOwnedSkills] = useState<string[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [progress, setProgress] = useState(getMatchesProgress);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(LEVEL_FILTER_ALL);
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [hideInternships, setHideInternships] = useState(false);
  const [hideGraduate, setHideGraduate] = useState(false);
  const [archivedOnly, setArchivedOnly] = useState(false);
  const [appliedOnly, setAppliedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [skills, setSkills] = useState<MatchSkill[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [skillPostings, setSkillPostings] = useState<SkillPostings | null>(
    null,
  );
  const { runs } = useRuns();
  const activeBriefRuns =
    runs?.filter(
      run => run.kind === RUN_KIND.MATCH_BRIEF && isActiveRunStatus(run.status),
    ).length ?? 0;
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

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(LANGUAGES_STORAGE_KEY) ?? '[]',
      );
      if (Array.isArray(stored)) {
        setLanguages(stored.filter(language => typeof language === 'string'));
      }
    } catch {
      // Blocked or corrupt storage: no language filtering applies.
    }
  }, []);

  const changeLanguages = (next: string[]) => {
    setLanguages(next);
    try {
      localStorage.setItem(LANGUAGES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Blocked storage: the choice lasts until reload.
    }
  };

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

  const generateBrief = async (url: string) => {
    try {
      await startMatchBrief(url);
      window.dispatchEvent(new Event(JOB_MATCHES_CHANGED_EVENT));
      toast.success(t('MATCHES.BRIEF_STARTED'), {
        action: {
          label: t('DIALOG.VIEW_PROGRESS'),
          onClick: () => router.push(RUNS_TAB_URL),
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('MATCHES.BRIEF_FAILED'),
      );
    }
  };

  const remove = (url?: string) =>
    removeMatchPostings(url)
      .then(setPostings)
      .catch(() => toast.error(t('MATCHES.SAVE_FAILED')));

  const archive = (url: string, archived: boolean, applied: boolean) =>
    setMatchPostingArchived(url, archived, applied)
      .then(setPostings)
      .catch(() => toast.error(t('MATCHES.SAVE_FAILED')));

  // Clearing also drops the suggested skills, which the postings produced.
  const clearAll = () => {
    setConfirmingClear(false);
    return remove()
      .then(fetchMatchSkills)
      .then(setSkills)
      .catch(() => undefined);
  };

  const customTerms = useMemo(
    () => skills.filter(skill => skill.status === MATCH_SKILL_STATUS.ACCEPTED),
    [skills],
  );
  const panelSkills = useMemo(
    () =>
      skills.filter(
        skill =>
          skill.status !== MATCH_SKILL_STATUS.SUGGESTED ||
          !isInVocabulary(skill),
      ),
    [skills],
  );
  const briefRunning = useMemo(
    () => new Set(postings.filter(p => p.briefRunning).map(p => p.url)),
    [postings],
  );

  // Briefs start on their own after a capture, so the page learns of a run
  // starting or ending from the run list rather than from its own click.
  useEffect(() => {
    window.dispatchEvent(new Event(JOB_MATCHES_CHANGED_EVENT));
  }, [activeBriefRuns]);

  const allMatches = useMemo(
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
  const matches = useMemo(
    () =>
      filterMatches(allMatches, {
        level: levelFilter,
        easyApplyOnly,
        languages,
        hideInternships,
        hideGraduate,
        archivedOnly,
        appliedOnly,
      }),
    [
      archivedOnly,
      appliedOnly,
      allMatches,
      levelFilter,
      easyApplyOnly,
      languages,
      hideInternships,
      hideGraduate,
    ],
  );
  const activeFilterCount = [
    levelFilter !== LEVEL_FILTER_ALL,
    languages.length > 0,
    hideInternships,
    hideGraduate,
  ].filter(Boolean).length;
  const archivedCount = allMatches.filter(match => match.archived).length;
  const viewCount = archivedOnly
    ? archivedCount
    : allMatches.length - archivedCount;
  const topGaps = useMemo(
    () => countGaps(matches).slice(0, TOP_GAP_COUNT),
    [matches],
  );

  const showSuggestedPostings = (skill: MatchSkill) => {
    const mentioning = new Set(
      postings
        .filter(posting => postingMentionsSkill(posting, skill))
        .map(posting => posting.url),
    );
    setSkillPostings({
      skill: skill.name,
      matches: allMatches.filter(match => mentioning.has(match.url)),
    });
  };

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
      {allMatches.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={archivedOnly ? 'outline' : 'default'}
              aria-pressed={!archivedOnly}
              onClick={() => setArchivedOnly(false)}
            >
              {t('MATCHES.SECTION_MATCHES', {
                count: String(allMatches.length - archivedCount),
              })}
            </Button>
            <Button
              variant={archivedOnly ? 'default' : 'outline'}
              aria-pressed={archivedOnly}
              onClick={() => setArchivedOnly(true)}
            >
              <Archive />
              {t('MATCHES.SECTION_ARCHIVED', {
                count: String(archivedCount),
              })}
            </Button>
            <span className="text-sm text-muted-foreground">
              {matches.length !== viewCount &&
                t('MATCHES.COUNT_FILTERED', {
                  shown: String(matches.length),
                  count: String(viewCount),
                })}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {archivedOnly && (
              <Button
                variant={appliedOnly ? 'default' : 'outline'}
                aria-pressed={appliedOnly}
                onClick={() => setAppliedOnly(!appliedOnly)}
              >
                <CheckCheck />
                {t('MATCHES.APPLIED_ONLY')}
              </Button>
            )}
            <ArrowUpDown aria-hidden className="size-4 text-muted-foreground" />
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
              }}
            />
            <Button
              variant={activeFilterCount ? 'default' : 'outline'}
              onClick={() => setFiltersOpen(true)}
            >
              <Filter />
              {t('MATCHES.FILTERS')}
              {activeFilterCount > 0 && ` · ${activeFilterCount}`}
            </Button>
            <Button
              variant={easyApplyOnly ? 'default' : 'outline'}
              aria-pressed={easyApplyOnly}
              onClick={() => setEasyApplyOnly(!easyApplyOnly)}
            >
              {t('MATCHES.EASY_APPLY')}
            </Button>
            <Button
              variant="outline"
              loading={suggesting}
              disabled={IS_DEMO}
              onClick={suggest}
            >
              <Sparkles />
              {t('MATCHES.SUGGEST')}
            </Button>
            <Button variant="outline" onClick={() => setConfirmingClear(true)}>
              <Trash2 />
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
      {allMatches.length === 0 && !loadFailed && !progress && (
        <p className="text-sm text-muted-foreground">{t('MATCHES.EMPTY')}</p>
      )}
      <JobMatchSkillsPanel
        skills={panelSkills}
        onAccept={name =>
          updateSkills(setMatchSkillStatus(name, MATCH_SKILL_STATUS.ACCEPTED))
        }
        onDismiss={name =>
          updateSkills(setMatchSkillStatus(name, MATCH_SKILL_STATUS.DISMISSED))
        }
        onRemove={name => updateSkills(removeMatchSkill(name))}
        onSelect={showSuggestedPostings}
      />
      <MatchFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        level={levelFilter}
        onLevelChange={setLevelFilter}
        languages={languages}
        onLanguagesChange={changeLanguages}
        hideInternships={hideInternships}
        onHideInternshipsChange={setHideInternships}
        hideGraduate={hideGraduate}
        onHideGraduateChange={setHideGraduate}
      />
      <SkillPostingsDialog
        selection={skillPostings}
        onClose={() => setSkillPostings(null)}
      />
      {topGaps.length > 0 && (
        <section className="flex shrink-0 flex-col gap-1">
          <h2 className={SECTION_HEADING_CLASS}>{t('MATCHES.TOP_GAPS')}</h2>
          <div className="flex flex-wrap gap-1">
            {topGaps.map(([skill, count]) => (
              <Badge key={skill} color="orange" variant="outline" size="1">
                <button
                  type="button"
                  onClick={() =>
                    setSkillPostings({
                      skill,
                      matches: matches.filter(match =>
                        match.gaps.includes(skill),
                      ),
                    })
                  }
                  className={SKILL_BADGE_BUTTON_CLASS}
                >
                  {skill} × {count}
                </button>
              </Badge>
            ))}
          </div>
        </section>
      )}
      {allMatches.length > 0 && matches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t('MATCHES.NO_FILTER_MATCHES')}
        </p>
      )}
      <Dialog open={confirmingClear} onOpenChange={setConfirmingClear}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t('MATCHES.CLEAR_TITLE')}</DialogTitle>
            <DialogDescription>
              {t('MATCHES.CLEAR_DESCRIPTION', {
                count: String(allMatches.length),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingClear(false)}>
              {t('MATCHES.CANCEL')}
            </Button>
            <Button variant="destructive" onClick={clearAll}>
              <Trash2 />
              {t('MATCHES.CLEAR')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {matches.map(match => (
        <MatchCard
          key={match.url}
          match={match}
          generating={briefRunning.has(match.url)}
          onRemove={() => remove(match.url)}
          onArchive={(archived, applied) =>
            archive(match.url, archived, applied)
          }
          onGenerateBrief={IS_DEMO ? undefined : () => generateBrief(match.url)}
        />
      ))}
    </div>
  );
};
