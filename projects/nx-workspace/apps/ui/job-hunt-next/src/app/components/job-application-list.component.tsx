'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  CircleCheck,
  ExternalLink,
  Trash2,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import {
  FILE_ENTRY_KIND,
  FileEntry,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
import {
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  BriefView,
  SECTION_HEADING_CLASS,
} from './application-brief.component';
import { CoverLetterTab } from './cover-letter-tab.component';
import { applicationResumeSource, ResumeTab } from './resume-tab.component';
import {
  CRUDItemList,
  EllipsisAction,
} from '@vigilant-broccoli/react-lib-higher-level';
import { EXPAND_LATEST, EXPAND_PARAM } from '../app.const';
import {
  APPLICATION_STATUS,
  APPLICATION_STATUSES,
  ApplicationStatus,
  CLEAR_STATUS,
} from '../constants/applications';
import { JOB_APPLICATIONS_CHANGED_EVENT } from '../constants/career';
import { IS_DEMO } from '../constants/demo';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { useTranslation } from '../i18n';
import {
  APPLICATION_FILE,
  Brief,
  findApplicationFile,
  parseApplicationFolder,
  parseBrief,
  parseGaps,
  readJobApplicationText,
} from '../utils/job-application-files.utils';
import {
  JobDescription,
  parseJobDescription,
} from '../utils/job-posting.utils';

const POSTING_URL_LINE = /^Posting URL:\s*(\S+)\s*\n?/;
const HTTP_URL = /^https?:\/\//i;
const POSTING_TAB = {
  TEXT: 'text',
  BRIEF: 'brief',
  RESUME: 'resume',
  COVER_LETTER: 'cover-letter',
} as const;
const TITLE_SEPARATOR = ' · ';
const STATUS_LABEL_KEYS = {
  [APPLICATION_STATUS.APPLIED]: 'APPLICATIONS.STATUS_APPLIED',
  [APPLICATION_STATUS.INTERVIEWING]: 'APPLICATIONS.STATUS_INTERVIEWING',
  [APPLICATION_STATUS.OFFER]: 'APPLICATIONS.STATUS_OFFER',
  [APPLICATION_STATUS.REJECTED]: 'APPLICATIONS.STATUS_REJECTED',
} as const;
const STATUS_BADGE_CLASSES = {
  [APPLICATION_STATUS.APPLIED]:
    'bg-green-500/20 text-green-700 dark:text-green-400',
  [APPLICATION_STATUS.INTERVIEWING]:
    'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  [APPLICATION_STATUS.OFFER]:
    'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  [APPLICATION_STATUS.REJECTED]: 'bg-red-500/20 text-red-700 dark:text-red-400',
} as const;

type ApplicationFileKind = Parameters<typeof findApplicationFile>[1];

type ApplicationItem = {
  id: string;
  title: string;
  label: string;
  date: string;
  created: string;
  status: ApplicationStatus | null;
};

type ApplicationDetails = {
  hasResumeSource: boolean;
  hasCoverLetter: boolean;
  description: JobDescription;
  // Null when the posting was pasted without a URL.
  postingUrl: string | null;
  // Null when the application has no brief file (made before it existed).
  brief: Brief | null;
  // The gaps file older applications have instead of a brief; null when
  // missing too.
  gaps: string[] | null;
};

type ItemAction = EllipsisAction & { icon: LucideIcon };

type ExpansionContextValue = {
  loadDetails: (item: ApplicationItem) => Promise<ApplicationDetails>;
};

const listFolder = async (path: string): Promise<FileEntry[]> => {
  const response = await fetch(
    `${API_ENDPOINTS.JOB_APPLICATIONS}?path=${encodeURIComponent(path)}`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.entries;
};

const listStatuses = async (): Promise<
  Record<string, ApplicationStatus | undefined>
> => {
  const response = await fetch(API_ENDPOINTS.JOB_APPLICATIONS_STATUS);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.statuses;
};

const listFiles = async (folder: string) =>
  (await listFolder(folder)).filter(
    entry => entry.kind === FILE_ENTRY_KIND.FILE,
  );

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

// The skill writes `Posting URL: <url>` as the first line when one was given.
const splitPosting = (text: string) => {
  const match = POSTING_URL_LINE.exec(text);
  return {
    url: match && HTTP_URL.test(match[1]) ? match[1] : null,
    body: match ? text.slice(match[0].length) : text,
  };
};

const findFileOrThrow = (
  files: FileEntry[],
  kind: ApplicationFileKind,
  missing: string,
) => {
  const file = findApplicationFile(files, kind);
  if (!file) throw new Error(missing);
  return file;
};

const DescriptionSection = ({
  heading,
  text,
}: {
  heading: string;
  text: string;
}) =>
  text ? (
    <section className="flex flex-col gap-1">
      <h3 className={SECTION_HEADING_CLASS}>{heading}</h3>
      <p className="whitespace-pre-wrap text-sm">{text}</p>
    </section>
  ) : null;

const GapsList = ({ gaps }: { gaps: string[] | null }) => {
  const { t } = useTranslation();
  if (gaps === null) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('APPLICATIONS.NO_BRIEF')}
      </p>
    );
  }
  return gaps.length ? (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {gaps.map(gap => (
        <li key={gap}>{gap}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm">{t('APPLICATIONS.NO_GAPS')}</p>
  );
};

const DescriptionView = ({
  description,
  postingUrl,
}: {
  description: JobDescription;
  postingUrl: string | null;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {[description.role, description.company]
            .filter(Boolean)
            .join(TITLE_SEPARATOR)}
        </h2>
        {postingUrl && (
          <Button
            variant="outline"
            onClick={() => window.open(postingUrl, '_blank', 'noopener')}
          >
            <ExternalLink size={14} /> {t('APPLICATIONS.OPEN_POSTING')}
          </Button>
        )}
      </div>
      <DescriptionSection
        heading={t('APPLICATIONS.ABOUT_JOB')}
        text={description.description}
      />
      <DescriptionSection
        heading={t('APPLICATIONS.ABOUT_COMPANY')}
        text={description.companyBlurb}
      />
    </div>
  );
};

const ExpansionContext = createContext<ExpansionContextValue | null>(null);

const ApplicationResume = ({
  folder,
  toolbarSlot,
}: {
  folder: string;
  toolbarSlot: HTMLElement | null;
}) => {
  const source = useMemo(() => applicationResumeSource(folder), [folder]);
  return <ResumeTab source={source} embedded toolbarSlot={toolbarSlot} />;
};

const ExpandedDetails = ({ item }: { item: ApplicationItem }) => {
  const { t } = useTranslation();
  const { loadDetails } = useContext(ExpansionContext) as ExpansionContextValue;
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [error, setError] = useState('');
  const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDetails(item)
      .then(result => !cancelled && setDetails(result))
      .catch(
        err =>
          !cancelled &&
          setError(errorMessage(err, t('APPLICATIONS.DETAILS_FAILED'))),
      );
    return () => {
      cancelled = true;
    };
  }, [item, loadDetails, t]);

  return (
    <div className="flex gap-4 border-t border-border pt-3">
      {details ? (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Tabs defaultValue={POSTING_TAB.TEXT}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList>
                <TabsTrigger value={POSTING_TAB.TEXT}>
                  {t('APPLICATIONS.TAB_POSTING')}
                </TabsTrigger>
                <TabsTrigger value={POSTING_TAB.BRIEF}>
                  {t('APPLICATIONS.TAB_BRIEF')}
                </TabsTrigger>
                <TabsTrigger value={POSTING_TAB.RESUME}>
                  {t('APPLICATIONS.TAB_RESUME')}
                </TabsTrigger>
                <TabsTrigger value={POSTING_TAB.COVER_LETTER}>
                  {t('APPLICATIONS.TAB_COVER_LETTER')}
                </TabsTrigger>
              </TabsList>
              <div ref={setToolbarSlot} />
            </div>
            <AnimatedHeight>
              <TabsContent value={POSTING_TAB.TEXT} className="pt-3">
                <DescriptionView
                  description={details.description}
                  postingUrl={IS_DEMO ? null : details.postingUrl}
                />
              </TabsContent>
              <TabsContent value={POSTING_TAB.BRIEF} className="pt-3">
                {details.brief ? (
                  <BriefView brief={details.brief} />
                ) : (
                  <GapsList gaps={details.gaps} />
                )}
              </TabsContent>
              <TabsContent value={POSTING_TAB.RESUME} className="pt-3">
                {details.hasResumeSource ? (
                  <ApplicationResume
                    folder={item.id}
                    toolbarSlot={toolbarSlot}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('RESUME.NONE')}
                  </p>
                )}
              </TabsContent>
              <TabsContent value={POSTING_TAB.COVER_LETTER} className="pt-3">
                {details.hasCoverLetter ? (
                  <CoverLetterTab folder={item.id} toolbarSlot={toolbarSlot} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('COVER_LETTER.NONE')}
                  </p>
                )}
              </TabsContent>
            </AnimatedHeight>
          </Tabs>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {error || t('APPLICATIONS.LOADING')}
        </p>
      )}
    </div>
  );
};

// Switching between Posting and Gaps changes the card's height in one jump;
// this eases the wrapper to the content's measured height instead. The first
// measurement goes from `auto` to pixels, which does not animate.
const AnimatedHeight = ({ children }: { children: ReactNode }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(([entry]) =>
      setHeight(entry.borderBoxSize[0].blockSize),
    );
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Contain tab-panel margins so the observed height includes them.
  return (
    <div
      className="overflow-hidden transition-[height] duration-200 ease-in-out motion-reduce:transition-none"
      style={{ height }}
    >
      <div ref={contentRef} className="flow-root">
        {children}
      </div>
    </div>
  );
};

const ApplicationRow = ({ item }: { item: ApplicationItem }) => {
  const { t } = useTranslation();
  return (
    <span className="flex items-center gap-2">
      <span className="block min-w-0 truncate text-sm font-medium">
        {item.title}
      </span>
      {item.status && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[item.status]}`}
        >
          {t(STATUS_LABEL_KEYS[item.status])}
        </span>
      )}
    </span>
  );
};

export const JobApplicationList = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [defaultExpandedIds, setDefaultExpandedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(
    async (expandLatest: boolean) => {
      try {
        const [entries, statuses] = await Promise.all([
          listFolder(''),
          listStatuses(),
        ]);
        const folders = entries.filter(
          entry => entry.kind === FILE_ENTRY_KIND.FOLDER,
        );
        const sorted = folders
          .map(folder => ({
            id: folder.path,
            created: folder.created,
            status: statuses[folder.path] ?? null,
            ...parseApplicationFolder(
              folder.name,
              folder.modified,
              folder.created,
            ),
          }))
          .sort(
            (a, b) =>
              b.date.localeCompare(a.date) ||
              b.created.localeCompare(a.created),
          );
        setItems(sorted);
        const wantsLatest =
          expandLatest &&
          new URLSearchParams(window.location.search).get(EXPAND_PARAM) ===
            EXPAND_LATEST;
        if (wantsLatest && sorted.length) setDefaultExpandedIds([sorted[0].id]);
      } catch (error) {
        toast.error(errorMessage(error, t('APPLICATIONS.LOAD_FAILED')));
      } finally {
        setLoaded(true);
      }
    },
    [t],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    const reload = () => {
      load(false);
    };
    window.addEventListener(JOB_APPLICATIONS_CHANGED_EVENT, reload);
    return () =>
      window.removeEventListener(JOB_APPLICATIONS_CHANGED_EVENT, reload);
  }, [load]);

  const loadDetails = useCallback(
    async (item: ApplicationItem) => {
      const files = await listFiles(item.id);
      const posting = findFileOrThrow(
        files,
        APPLICATION_FILE.POSTING,
        t('APPLICATIONS.NO_POSTING'),
      );
      const gapsFile = findApplicationFile(files, APPLICATION_FILE.GAPS);
      const briefFile = findApplicationFile(files, APPLICATION_FILE.BRIEF);
      const [postingText, gapsText, briefText] = await Promise.all([
        readJobApplicationText(posting.path),
        gapsFile ? readJobApplicationText(gapsFile.path) : null,
        briefFile ? readJobApplicationText(briefFile.path) : null,
      ]);
      const { url, body } = splitPosting(postingText);
      return {
        description: parseJobDescription(body),
        postingUrl: url,
        brief: briefText === null ? null : parseBrief(briefText),
        gaps: gapsText === null ? null : parseGaps(gapsText),
        hasResumeSource: !!findApplicationFile(
          files,
          APPLICATION_FILE.RESUME_SOURCE,
        ),
        hasCoverLetter: !!findApplicationFile(
          files,
          APPLICATION_FILE.COVER_LETTER_TEXT,
        ),
      };
    },
    [t],
  );

  const itemActions = (item: ApplicationItem): ItemAction[] => [
    ...APPLICATION_STATUSES.filter(status => status !== item.status).map(
      (status): ItemAction => ({
        label: t('APPLICATIONS.MARK_STATUS', {
          status: t(STATUS_LABEL_KEYS[status]).toLowerCase(),
        }),
        icon: CircleCheck,
        onSelect: () => setStatus(item, status),
      }),
    ),
    ...(item.status
      ? [
          {
            label: t('APPLICATIONS.CLEAR_STATUS'),
            icon: Undo2,
            onSelect: () => setStatus(item, null),
          },
        ]
      : []),
    {
      label: t('APPLICATIONS.DELETE'),
      icon: Trash2,
      color: 'red',
      onSelect: () => deleteApplication(item),
      confirm: {
        title: t('APPLICATIONS.DELETE_TITLE'),
        description: t('APPLICATIONS.DELETE_DESCRIPTION', {
          label: item.label,
        }),
        confirmLabel: t('APPLICATIONS.DELETE'),
      },
    },
  ];

  const visibleItemActions = (item: ApplicationItem) =>
    IS_DEMO ? [] : itemActions(item);

  const setStatus = async (
    item: ApplicationItem,
    status: ApplicationStatus | null,
  ) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.JOB_APPLICATIONS_STATUS}?path=${encodeURIComponent(item.id)}&status=${status ?? CLEAR_STATUS}`,
        { method: HTTP_METHOD.PUT },
      );
      if (!response.ok) throw new Error((await response.json()).error);
      setItems(previous =>
        previous.map(entry =>
          entry.id === item.id ? { ...entry, status } : entry,
        ),
      );
      toast.success(
        t(
          status
            ? 'APPLICATIONS.STATUS_UPDATED'
            : 'APPLICATIONS.STATUS_CLEARED',
        ),
      );
    } catch (error) {
      toast.error(errorMessage(error, t('APPLICATIONS.STATUS_FAILED')));
    }
  };

  const deleteApplication = async (item: ApplicationItem) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.JOB_APPLICATIONS}?path=${encodeURIComponent(item.id)}`,
        { method: HTTP_METHOD.DELETE },
      );
      if (!response.ok) throw new Error((await response.json()).error);
      setItems(previous => previous.filter(entry => entry.id !== item.id));
      toast.success(t('APPLICATIONS.DELETED'));
    } catch (error) {
      toast.error(errorMessage(error, t('APPLICATIONS.DELETE_FAILED')));
    }
  };

  const query = search.trim().toLowerCase();
  const visibleItems = useMemo(
    () =>
      query
        ? items.filter(item =>
            [item.title, item.status && t(STATUS_LABEL_KEYS[item.status])]
              .join(' ')
              .toLowerCase()
              .includes(query),
          )
        : items,
    [items, query, t],
  );

  const copy = useMemo(
    () => ({
      LIST: {
        TITLE: '',
        EMPTY_MESSAGE: loaded
          ? t(query ? 'APPLICATIONS.NO_MATCHES' : 'APPLICATIONS.EMPTY')
          : '',
      },
      CREATE: { TITLE: '', DESCRIPTION: '' },
      UPDATE: { TITLE: '', DESCRIPTION: '' },
    }),
    [loaded, query, t],
  );

  return (
    <>
      <ExpansionContext.Provider value={{ loadDetails }}>
        {loaded && items.length > 0 && (
          <Input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t('APPLICATIONS.SEARCH_PLACEHOLDER')}
            className="mb-2"
          />
        )}
        {loaded && (
          <CRUDItemList
            items={visibleItems}
            defaultExpandedIds={defaultExpandedIds}
            setItems={setItems}
            ListItemComponent={ApplicationRow}
            itemActions={visibleItemActions}
            ExpandedComponent={ExpandedDetails}
            copy={copy}
            isCards
          />
        )}
      </ExpansionContext.Provider>
    </>
  );
};
