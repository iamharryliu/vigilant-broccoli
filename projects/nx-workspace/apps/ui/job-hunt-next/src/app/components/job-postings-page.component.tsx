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
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EllipsisCTA,
  Select,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { RUNS_TAB_URL } from '../app.const';
import {
  CAREER_FILE_KIND,
  JOB_APPLICATIONS_CHANGED_EVENT,
} from '../constants/career';
import { IS_DEMO } from '../constants/demo';
import {
  CAPTURE_PROGRESS_EVENT,
  POSTING_SKILL_STATUS,
  SAVED_POSTINGS_CHANGED_EVENT,
} from '../constants/saved-postings';
import { isActiveRunStatus, RUN_KIND } from '../constants/runs';
import { usePostingSkills } from '../hooks/use-posting-skills';
import { useRuns } from '../hooks/use-runs';
import {
  listApplicationPostingUrls,
  useStartApplicationRun,
} from '../hooks/use-start-application-run';
import { useTranslation } from '../i18n';
import { undoToast } from '../utils/undo-toast.utils';
import { getCaptureProgress } from '../utils/capture-progress.utils';
import {
  fetchDeletedSavedPostings,
  fetchSavedPostings,
  clearSavedPostings,
  removeSavedPosting,
  restoreSavedPosting,
  restoreSavedPostings,
  setSavedPostingArchived,
  startPostingBrief,
  type SavedPosting,
} from '../utils/saved-postings-storage.utils';
import {
  LEVEL_FILTER_ALL,
  MATCH_LEVEL,
  JOB_POSTINGS_VIEW,
  SORT_OPTION,
  type JobMatch,
  type LevelFilter,
  type JobPostingsView,
  type MatchLevel,
  type SortOption,
  filterMatches,
  matchPosting,
  parseOwnedSkills,
  sortMatches,
} from '../utils/posting-match.utils';
import { SECTION_HEADING_CLASS } from './application-brief.component';
import { RecapturePostingDialog } from './recapture-posting-dialog.component';
import { JobPostingsFiltersDialog } from './job-postings-filters-dialog.component';
import {
  BLOCK_CLASS,
  PostingBriefDetails,
  PostingBriefSummary,
} from './posting-brief.component';
import { TabbedListContainer } from './tabbed-list-container.component';

// Stored choices from before the Job postings rename keep their keys, so
// they survive it.
const SORT_STORAGE_KEY = 'job-hunt-matches-sort';
const LANGUAGES_STORAGE_KEY = 'job-hunt-matches-languages';
// Matches the card's `duration-300` exit transition.
const EXIT_ANIMATION_MS = 300;
const FILTERS_STORAGE_KEY = 'job-hunt-matches-filters';

const LEVEL_BADGE = {
  [MATCH_LEVEL.STRONG]: { color: 'green', key: 'JOB_POSTINGS.STRONG' },
  [MATCH_LEVEL.OKAY]: { color: 'amber', key: 'JOB_POSTINGS.OKAY' },
  [MATCH_LEVEL.WEAK]: { color: 'red', key: 'JOB_POSTINGS.WEAK' },
  [MATCH_LEVEL.UNKNOWN]: { color: 'gray', key: 'JOB_POSTINGS.UNKNOWN' },
} as const satisfies Record<MatchLevel, { color: string; key: string }>;

const JobPostingCard = ({
  match,
  generating,
  onRemove,
  onArchive,
  onRedo,
  onRestore,
  onGenerateBrief,
  onCreateApplication,
  leaving,
}: {
  match: JobMatch;
  generating: boolean;
  onRemove: () => void;
  onArchive: (archived: boolean, applied: boolean) => void;
  onRedo?: () => void;
  // Set on a soft-deleted posting, whose only action is restoring it.
  onRestore?: () => void;
  leaving: boolean;
  onGenerateBrief?: () => void;
  // Unset in the demo and once the posting has an application.
  onCreateApplication?: () => void;
}) => {
  const { t } = useTranslation();
  const badge = LEVEL_BADGE[match.level];
  return (
    // Collapsing the grid row animates the height; the inner wrapper clips.
    <div
      className={`grid shrink-0 transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
        leaving
          ? 'grid-rows-[0fr] -translate-x-4 opacity-0'
          : 'grid-rows-[1fr] opacity-100'
      }`}
    >
      <div className="min-h-0 overflow-hidden">
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
                      t('JOB_POSTINGS.POSTED', {
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
                  {t('JOB_POSTINGS.EASY_APPLY')}
                </Badge>
              )}
              <Badge color={badge.color} variant="soft" size="1">
                {t(badge.key)}
                {match.level !== MATCH_LEVEL.UNKNOWN &&
                  ` · ${Math.round(match.ratio * 100)}%`}
              </Badge>
              {match.applied && (
                <Badge color="green" variant="solid" size="1">
                  {t('JOB_POSTINGS.APPLIED')}
                </Badge>
              )}
              {onRestore ? (
                <EllipsisCTA
                  actions={[
                    {
                      label: t('JOB_POSTINGS.RESTORE_DELETED'),
                      icon: <ArchiveRestore size={16} />,
                      onSelect: onRestore,
                    },
                  ]}
                />
              ) : (
                <EllipsisCTA
                  actions={[
                    ...(onCreateApplication
                      ? [
                          {
                            label: t('JOB_POSTINGS.CREATE_APPLICATION'),
                            icon: <Sparkles size={16} />,
                            onSelect: onCreateApplication,
                          },
                        ]
                      : []),
                    ...(match.applied
                      ? []
                      : [
                          {
                            label: t('JOB_POSTINGS.MARK_APPLIED'),
                            icon: <CheckCheck size={16} />,
                            onSelect: () => onArchive(true, true),
                          },
                        ]),
                    ...(match.applied
                      ? [
                          {
                            label: t('JOB_POSTINGS.MOVE_TO_ARCHIVED'),
                            icon: <Archive size={16} />,
                            onSelect: () => onArchive(true, false),
                          },
                        ]
                      : []),
                    {
                      label: match.archived
                        ? t('JOB_POSTINGS.UNARCHIVE')
                        : t('JOB_POSTINGS.ARCHIVE'),
                      icon: match.archived ? (
                        <ArchiveRestore size={16} />
                      ) : (
                        <Archive size={16} />
                      ),
                      onSelect: () => onArchive(!match.archived, false),
                    },
                    ...(onRedo
                      ? [
                          {
                            label: t('JOB_POSTINGS.RECAPTURE'),
                            icon: <RefreshCw size={16} />,
                            onSelect: onRedo,
                          },
                        ]
                      : []),
                    {
                      label: t('JOB_POSTINGS.REMOVE'),
                      icon: <Trash2 size={16} />,
                      color: 'red',
                      onSelect: onRemove,
                      confirm: {
                        title: t('JOB_POSTINGS.REMOVE_TITLE'),
                        description: t('JOB_POSTINGS.REMOVE_DESCRIPTION', {
                          role: match.role,
                        }),
                        confirmLabel: t('JOB_POSTINGS.REMOVE'),
                      },
                    },
                  ]}
                />
              )}
            </div>
          </div>
          <PostingBriefSummary
            brief={match.brief}
            generating={generating}
            onGenerate={onGenerateBrief}
          />
          {(match.matched.length > 0 || match.gaps.length > 0) && (
            <div
              className={`-mx-3 grid gap-2 ${match.matched.length > 0 && match.gaps.length > 0 ? 'sm:grid-cols-2' : ''}`}
            >
              {match.matched.length > 0 && (
                <div className={`flex flex-col gap-1 ${BLOCK_CLASS}`}>
                  <span className={SECTION_HEADING_CLASS}>
                    {t('JOB_POSTINGS.MATCHED')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {match.matched.map(skill => (
                      <Badge key={skill} color="green" variant="soft" size="1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {match.gaps.length > 0 && (
                <div className={`flex flex-col gap-1 ${BLOCK_CLASS}`}>
                  <span className={SECTION_HEADING_CLASS}>
                    {t('JOB_POSTINGS.GAPS')}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {match.gaps.map(skill => (
                      <Badge
                        key={skill}
                        color="orange"
                        variant="outline"
                        size="1"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <PostingBriefDetails brief={match.brief} />
        </Card>
      </div>
    </div>
  );
};

export const JobPostingsPage = () => {
  const { t } = useTranslation();
  const [postings, setPostings] = useState<SavedPosting[]>([]);
  const [ownedSkills, setOwnedSkills] = useState<string[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [progress, setProgress] = useState(getCaptureProgress);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(LEVEL_FILTER_ALL);
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [hideInternships, setHideInternships] = useState(false);
  const [hideGraduate, setHideGraduate] = useState(false);
  const [view, setView] = useState<JobPostingsView>(JOB_POSTINGS_VIEW.ACTIVE);
  const [deletedPostings, setDeletedPostings] = useState<SavedPosting[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [redoing, setRedoing] = useState<SavedPosting | null>(null);
  // Posting URLs that already have an application, which hides Create
  // application; null until loaded so the action never flashes in.
  const [applicationUrls, setApplicationUrls] = useState<Set<string> | null>(
    null,
  );
  const { skills } = usePostingSkills();
  const { runs } = useRuns();
  const startApplicationRun = useStartApplicationRun();
  const activeBriefRuns =
    runs?.filter(
      run =>
        run.kind === RUN_KIND.POSTING_BRIEF && isActiveRunStatus(run.status),
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

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(FILTERS_STORAGE_KEY) ?? '{}',
      );
      if (typeof stored.level === 'string') setLevelFilter(stored.level);
      setEasyApplyOnly(stored.easyApplyOnly === true);
      setHideInternships(stored.hideInternships === true);
      setHideGraduate(stored.hideGraduate === true);
      const savedView = Object.values(JOB_POSTINGS_VIEW).find(
        option => option === stored.view,
      );
      if (savedView) setView(savedView);
    } catch {
      // Blocked or corrupt storage: the filters start cleared.
    }
    setFiltersLoaded(true);
  }, []);

  // Saving waits for the load above, or the cleared defaults would overwrite
  // the stored choice on first render.
  useEffect(() => {
    if (!filtersLoaded) return;
    try {
      localStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({
          level: levelFilter,
          easyApplyOnly,
          hideInternships,
          hideGraduate,
          view,
        }),
      );
    } catch {
      // Blocked storage: the choice lasts until reload.
    }
  }, [
    filtersLoaded,
    levelFilter,
    easyApplyOnly,
    hideInternships,
    hideGraduate,
    view,
  ]);

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
    const update = () => setProgress(getCaptureProgress());
    update();
    window.addEventListener(CAPTURE_PROGRESS_EVENT, update);
    return () => window.removeEventListener(CAPTURE_PROGRESS_EVENT, update);
  }, []);

  useEffect(() => {
    const reload = () => {
      fetchSavedPostings()
        .then(setPostings)
        .catch(() => setLoadFailed(true));
      fetchDeletedSavedPostings()
        .then(setDeletedPostings)
        .catch(() => setLoadFailed(true));
    };
    reload();
    window.addEventListener(SAVED_POSTINGS_CHANGED_EVENT, reload);
    return () =>
      window.removeEventListener(SAVED_POSTINGS_CHANGED_EVENT, reload);
  }, []);

  // A finished application run writes the posting file this list reads.
  useEffect(() => {
    if (IS_DEMO) return;
    const reload = () =>
      listApplicationPostingUrls()
        .then(urls => setApplicationUrls(new Set(urls)))
        .catch(() => setApplicationUrls(new Set()));
    reload();
    window.addEventListener(JOB_APPLICATIONS_CHANGED_EVENT, reload);
    return () =>
      window.removeEventListener(JOB_APPLICATIONS_CHANGED_EVENT, reload);
  }, []);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.CAREER}?kind=${CAREER_FILE_KIND.CAREER_EXPERIENCE}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => setOwnedSkills(parseOwnedSkills(data.content)))
      .catch(() => setLoadFailed(true));
  }, []);

  const generateBrief = async (url: string) => {
    try {
      await startPostingBrief(url);
      window.dispatchEvent(new Event(SAVED_POSTINGS_CHANGED_EVENT));
      toast.success(t('JOB_POSTINGS.BRIEF_STARTED'), {
        action: {
          label: t('DIALOG.VIEW_PROGRESS'),
          onClick: () => router.push(RUNS_TAB_URL),
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('JOB_POSTINGS.BRIEF_FAILED'),
      );
    }
  };

  // Plays the card's exit animation before the request moves or removes it.
  const exitThen = <T,>(url: string, request: () => Promise<T>) => {
    setLeaving(previous => new Set(previous).add(url));
    return new Promise<void>(resolve => setTimeout(resolve, EXIT_ANIMATION_MS))
      .then(request)
      .finally(() =>
        setLeaving(previous => {
          const next = new Set(previous);
          next.delete(url);
          return next;
        }),
      );
  };

  const restoreDeleted = (url: string) =>
    restoreSavedPosting(url)
      .then(setPostings)
      .then(fetchDeletedSavedPostings)
      .then(setDeletedPostings)
      .catch(() => toast.error(t('JOB_POSTINGS.SAVE_FAILED')));

  const remove = (url: string) =>
    exitThen(url, () => removeSavedPosting(url))
      .then(next => {
        setPostings(next);
        fetchDeletedSavedPostings().then(setDeletedPostings);
        undoToast(t('JOB_POSTINGS.UNDO_DELETED'), t('JOB_POSTINGS.UNDO'), () =>
          restoreDeleted(url),
        );
      })
      .catch(() => toast.error(t('JOB_POSTINGS.SAVE_FAILED')));

  const archive = (url: string, archived: boolean, applied: boolean) => {
    const previous = postings.find(posting => posting.url === url);
    return exitThen(url, () => setSavedPostingArchived(url, archived, applied))
      .then(next => {
        setPostings(next);
        if (!previous) return;
        undoToast(
          t(
            applied
              ? 'JOB_POSTINGS.UNDO_APPLIED'
              : archived
                ? 'JOB_POSTINGS.UNDO_ARCHIVED'
                : 'JOB_POSTINGS.UNDO_RESTORED',
          ),
          t('JOB_POSTINGS.UNDO'),
          () =>
            setSavedPostingArchived(url, previous.archived, previous.applied)
              .then(setPostings)
              .catch(() => toast.error(t('JOB_POSTINGS.SAVE_FAILED'))),
        );
      })
      .catch(() => toast.error(t('JOB_POSTINGS.SAVE_FAILED')));
  };

  // Marks the posting applied only once the run has started, so a refused
  // run (such as a missing resume identity) leaves it where it was.
  const createApplication = async (posting: SavedPosting) => {
    if (!(await startApplicationRun(posting))) return;
    setApplicationUrls(previous => new Set(previous).add(posting.url));
    if (!posting.applied) archive(posting.url, true, true);
  };

  const clearAll = () =>
    clearSavedPostings()
      .then(({ postings: next, deleted }) => {
        setPostings(next);
        fetchDeletedSavedPostings().then(setDeletedPostings);
        undoToast(t('JOB_POSTINGS.UNDO_CLEARED'), t('JOB_POSTINGS.UNDO'), () =>
          restoreSavedPostings(deleted)
            .then(setPostings)
            .then(fetchDeletedSavedPostings)
            .then(setDeletedPostings)
            .catch(() => toast.error(t('JOB_POSTINGS.SAVE_FAILED'))),
        );
      })
      .catch(() => toast.error(t('JOB_POSTINGS.SAVE_FAILED')));

  const customTerms = useMemo(
    () =>
      skills.filter(skill => skill.status === POSTING_SKILL_STATUS.ACCEPTED),
    [skills],
  );
  const briefRunning = useMemo(
    () => new Set(postings.filter(p => p.briefRunning).map(p => p.url)),
    [postings],
  );

  // Briefs start on their own after a capture, so the page learns of a run
  // starting or ending from the run list rather than from its own click.
  useEffect(() => {
    window.dispatchEvent(new Event(SAVED_POSTINGS_CHANGED_EVENT));
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
        view:
          view === JOB_POSTINGS_VIEW.DELETED ||
          view === JOB_POSTINGS_VIEW.SETTINGS
            ? JOB_POSTINGS_VIEW.ACTIVE
            : view,
      }),
    [
      view,
      allMatches,
      levelFilter,
      easyApplyOnly,
      languages,
      hideInternships,
      hideGraduate,
    ],
  );
  const deletedMatches = useMemo(
    () =>
      ownedSkills
        ? deletedPostings.map(posting =>
            matchPosting(posting, ownedSkills, customTerms),
          )
        : [],
    [deletedPostings, ownedSkills, customTerms],
  );
  const isDeletedView = view === JOB_POSTINGS_VIEW.DELETED;
  const shown = isDeletedView ? deletedMatches : matches;
  const activeFilterCount = [
    levelFilter !== LEVEL_FILTER_ALL,
    languages.length > 0,
    hideInternships,
    hideGraduate,
  ].filter(Boolean).length;
  const findPosting = (url: string) =>
    postings.find(posting => posting.url === url);

  return (
    <div className="flex flex-col gap-3">
      {progress && (
        <div className="flex shrink-0 items-center gap-2 rounded-md bg-muted p-3 text-sm">
          <Loader2 className="size-4 animate-spin" />
          {t('JOB_POSTINGS.CAPTURING', {
            captured: String(progress.captured),
            seen: String(progress.seen),
          })}
        </div>
      )}
      <TabbedListContainer
        showTabs={allMatches.length > 0 || deletedMatches.length > 0}
        view={view}
        onViewChange={next => setView(next as JobPostingsView)}
        settingsLabel={t('JOB_POSTINGS.SECTION_SETTINGS')}
        tabs={[
          {
            value: JOB_POSTINGS_VIEW.ACTIVE,
            label: t('JOB_POSTINGS.SECTION_ACTIVE', {
              count: String(allMatches.filter(match => !match.archived).length),
            }),
          },
          {
            value: JOB_POSTINGS_VIEW.APPLIED,
            icon: <CheckCheck size={14} />,
            label: t('JOB_POSTINGS.SECTION_APPLIED', {
              count: String(
                allMatches.filter(match => match.archived && match.applied)
                  .length,
              ),
            }),
          },
          {
            value: JOB_POSTINGS_VIEW.ARCHIVED,
            icon: <Archive size={14} />,
            label: t('JOB_POSTINGS.SECTION_ARCHIVED', {
              count: String(
                allMatches.filter(match => match.archived && !match.applied)
                  .length,
              ),
            }),
          },
          {
            value: JOB_POSTINGS_VIEW.DELETED,
            icon: <Trash2 size={14} />,
            label: t('JOB_POSTINGS.SECTION_DELETED', {
              count: String(deletedMatches.length),
            }),
          },
        ]}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <ArrowUpDown aria-hidden className="size-4 text-muted-foreground" />
            <Select
              aria-label={t('JOB_POSTINGS.SORT')}
              options={Object.values(SORT_OPTION)}
              value={sortOption}
              onValueChange={changeSort}
              displayMapper={{
                [SORT_OPTION.BEST_MATCH]: t('JOB_POSTINGS.SORT_BEST_MATCH'),
                [SORT_OPTION.FEWEST_GAPS]: t('JOB_POSTINGS.SORT_FEWEST_GAPS'),
                [SORT_OPTION.MOST_MATCHED]: t('JOB_POSTINGS.SORT_MOST_MATCHED'),
                [SORT_OPTION.POSTED]: t('JOB_POSTINGS.SORT_POSTED'),
                [SORT_OPTION.NEWEST]: t('JOB_POSTINGS.SORT_NEWEST'),
              }}
            />
            <Button
              variant={activeFilterCount ? 'default' : 'outline'}
              onClick={() => setFiltersOpen(true)}
            >
              <Filter />
              {t('JOB_POSTINGS.FILTERS')}
              {activeFilterCount > 0 && ` · ${activeFilterCount}`}
            </Button>
            <Button
              variant={easyApplyOnly ? 'default' : 'outline'}
              aria-pressed={easyApplyOnly}
              onClick={() => setEasyApplyOnly(!easyApplyOnly)}
            >
              {t('JOB_POSTINGS.EASY_APPLY')}
            </Button>
          </div>
        }
        clearAll={{
          title: t('JOB_POSTINGS.CLEAR'),
          description: t('JOB_POSTINGS.CLEAR_DESCRIPTION', {
            count: String(allMatches.length),
          }),
          actionLabel: t('JOB_POSTINGS.CLEAR'),
          confirmTitle: t('JOB_POSTINGS.CLEAR_TITLE'),
          cancelLabel: t('JOB_POSTINGS.CANCEL'),
          disabled: allMatches.length === 0,
          onConfirm: clearAll,
        }}
      >
        {loadFailed && (
          <p className="text-sm text-destructive">
            {t('JOB_POSTINGS.LOAD_FAILED')}
          </p>
        )}
        {!loadFailed && ownedSkills?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('JOB_POSTINGS.NO_SKILLS')}
          </p>
        )}
        <JobPostingsFiltersDialog
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
        {!isDeletedView && allMatches.length > 0 && matches.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('JOB_POSTINGS.NO_FILTER_MATCHES')}
          </p>
        )}
        <RecapturePostingDialog
          posting={redoing}
          onClose={() => setRedoing(null)}
        />
        {shown.map(match => {
          const posting = findPosting(match.url);
          return (
            <JobPostingCard
              key={match.url}
              match={match}
              onRestore={
                isDeletedView ? () => restoreDeleted(match.url) : undefined
              }
              generating={briefRunning.has(match.url)}
              leaving={leaving.has(match.url)}
              onRemove={() => remove(match.url)}
              onArchive={(archived, applied) =>
                archive(match.url, archived, applied)
              }
              onRedo={IS_DEMO ? undefined : () => setRedoing(posting ?? null)}
              onGenerateBrief={
                IS_DEMO ? undefined : () => generateBrief(match.url)
              }
              onCreateApplication={
                posting && applicationUrls && !applicationUrls.has(match.url)
                  ? () => createApplication(posting)
                  : undefined
              }
            />
          );
        })}
      </TabbedListContainer>
    </div>
  );
};
