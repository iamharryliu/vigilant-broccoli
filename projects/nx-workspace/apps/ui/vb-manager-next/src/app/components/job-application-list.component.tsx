'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Copy,
  FileText,
  FolderOpen,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { FILE_ENTRY_KIND, FileEntry } from '@vigilant-broccoli/common-js';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  CRUDItemList,
  EllipsisAction,
} from '@vigilant-broccoli/react-lib-higher-level';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { authFetch } from '../../../libs/auth';
import { SAMPLE_EXPAND_LATEST, SAMPLE_EXPAND_PARAM } from '../app.const';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  APPLICATION_FILE,
  createJobApplicationObjectUrl,
  findApplicationFile,
  parseApplicationFolder,
  parseGaps,
  readJobApplicationText,
} from '../utils/job-application-files.utils';
import {
  JobDescription,
  parseJobDescription,
} from '../utils/job-posting.utils';

const POSTING_URL_LINE = /^Posting URL:\s*(\S+)\s*\n?/;
const HTTP_URL = /^https?:\/\//i;
const LIST_COPY = {
  LIST: { TITLE: '', EMPTY_MESSAGE: 'No job applications yet.' },
  CREATE: { TITLE: '', DESCRIPTION: '' },
  UPDATE: { TITLE: '', DESCRIPTION: '' },
};

const POSTING_TAB = { TEXT: 'text', GAPS: 'gaps' } as const;

const ACTION_LABEL = {
  RESUME: 'View resume',
  COVER_LETTER: 'View cover letter',
  FINDER: 'Open in Finder',
} as const;

const ACTION_ICONS: Record<string, LucideIcon> = {
  [ACTION_LABEL.RESUME]: FileText,
  [ACTION_LABEL.COVER_LETTER]: Mail,
  [ACTION_LABEL.FINDER]: FolderOpen,
};

type ApplicationItem = {
  id: string;
  title: string;
  label: string;
  date: string;
  created: string;
};

type Viewer = {
  title: string;
  pdfUrl?: string;
  // Path of the plain-text cover letter, copied by the dialog's Copy button.
  copyPath?: string;
};

const listFolder = async (path: string): Promise<FileEntry[]> => {
  const response = await authFetch(
    `${API_ENDPOINTS.JOB_APPLICATIONS}?path=${encodeURIComponent(path)}`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.entries;
};

const listFiles = async (folder: string) =>
  (await listFolder(folder)).filter(
    entry => entry.kind === FILE_ENTRY_KIND.FILE,
  );

const reportError = (error: unknown, fallback: string) =>
  toast.error(error instanceof Error ? error.message : fallback);

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
  kind: Parameters<typeof findApplicationFile>[1],
  missing: string,
) => {
  const file = findApplicationFile(files, kind);
  if (!file) throw new Error(missing);
  return file;
};

const SECTION_HEADING_CLASS =
  'text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400';

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

const GapsList = ({ gaps }: { gaps: string[] | null }) =>
  gaps === null ? (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      No gaps document saved for this application.
    </p>
  ) : gaps.length ? (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {gaps.map(gap => (
        <li key={gap}>{gap}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm">No gaps found against the posting.</p>
  );

const TITLE_SEPARATOR = ' · ';

const DescriptionView = ({ description }: { description: JobDescription }) => (
  <div className="flex min-w-0 flex-1 flex-col gap-4">
    {(description.role || description.company) && (
      <h2 className="text-lg font-semibold">
        {[description.role, description.company]
          .filter(Boolean)
          .join(TITLE_SEPARATOR)}
      </h2>
    )}
    <DescriptionSection
      heading="About the job"
      text={description.description}
    />
    <DescriptionSection
      heading="About the company"
      text={description.companyBlurb}
    />
  </div>
);

type ApplicationDetails = {
  description: JobDescription;
  // Null when the application has no gaps file (made before it existed).
  gaps: string[] | null;
};

type ExpansionContextValue = {
  actionsFor: (item: ApplicationItem) => EllipsisAction[];
  loadDetails: (item: ApplicationItem) => Promise<ApplicationDetails>;
};

const ExpansionContext = createContext<ExpansionContextValue | null>(null);

const ExpandedDetails = ({ item }: { item: ApplicationItem }) => {
  const { actionsFor, loadDetails } = useContext(
    ExpansionContext,
  ) as ExpansionContextValue;
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadDetails(item)
      .then(result => !cancelled && setDetails(result))
      .catch(
        err =>
          !cancelled &&
          setError(err instanceof Error ? err.message : 'Failed to load'),
      );
    return () => {
      cancelled = true;
    };
  }, [item, loadDetails]);

  return (
    <div className="flex gap-4 border-t border-gray-200 pt-3 dark:border-gray-700">
      <div className="flex w-36 shrink-0 flex-col gap-1 sm:w-44">
        {actionsFor(item).map(action => {
          const Icon = ACTION_ICONS[action.label];
          return (
            <Button
              key={action.label}
              variant="ghost"
              className="justify-start"
              onClick={() => action.onSelect()}
            >
              <Icon size={14} />
              {action.label}
            </Button>
          );
        })}
      </div>
      {details ? (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Tabs defaultValue={POSTING_TAB.TEXT}>
            <TabsList>
              <TabsTrigger value={POSTING_TAB.TEXT}>Posting</TabsTrigger>
              <TabsTrigger value={POSTING_TAB.GAPS}>Gaps</TabsTrigger>
            </TabsList>
            <TabsContent value={POSTING_TAB.TEXT} className="pt-3">
              <DescriptionView description={details.description} />
            </TabsContent>
            <TabsContent value={POSTING_TAB.GAPS} className="pt-3">
              <GapsList gaps={details.gaps} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || 'Loading…'}
        </p>
      )}
    </div>
  );
};

const ApplicationRow = ({ item }: { item: ApplicationItem }) => (
  <span className="block truncate text-sm font-medium">{item.title}</span>
);

export const JobApplicationList = () => {
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [defaultExpandedIds, setDefaultExpandedIds] = useState<string[]>([]);
  const [viewer, setViewer] = useState<Viewer | null>(null);

  const load = useCallback(async () => {
    try {
      const folders = (await listFolder('')).filter(
        entry => entry.kind === FILE_ENTRY_KIND.FOLDER,
      );
      const sorted = folders
        .map(folder => ({
          id: folder.path,
          created: folder.created,
          ...parseApplicationFolder(
            folder.name,
            folder.modified,
            folder.created,
          ),
        }))
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || b.created.localeCompare(a.created),
        );
      setItems(sorted);
      const wantsLatest =
        new URLSearchParams(window.location.search).get(SAMPLE_EXPAND_PARAM) ===
        SAMPLE_EXPAND_LATEST;
      if (wantsLatest && sorted.length) setDefaultExpandedIds([sorted[0].id]);
    } catch (error) {
      reportError(error, 'Failed to load job applications');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(
    () => () => {
      if (viewer?.pdfUrl) URL.revokeObjectURL(viewer.pdfUrl);
    },
    [viewer],
  );

  const openInFinder = async (item: ApplicationItem) => {
    try {
      const response = await authFetch(API_ENDPOINTS.JOB_APPLICATIONS_OPEN, {
        method: HTTP_METHOD.POST,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ path: item.id }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
    } catch (error) {
      reportError(error, 'Failed to open in Finder');
    }
  };

  const loadDetails = useCallback(async (item: ApplicationItem) => {
    const files = await listFiles(item.id);
    const posting = findFileOrThrow(
      files,
      APPLICATION_FILE.POSTING,
      'No posting saved for this application.',
    );
    const gapsFile = findApplicationFile(files, APPLICATION_FILE.GAPS);
    const [postingText, gapsText] = await Promise.all([
      readJobApplicationText(posting.path),
      gapsFile ? readJobApplicationText(gapsFile.path) : null,
    ]);
    return {
      description: parseJobDescription(splitPosting(postingText).body),
      gaps: gapsText === null ? null : parseGaps(gapsText),
    };
  }, []);

  const viewPdf = async (
    item: ApplicationItem,
    kind: Parameters<typeof findApplicationFile>[1],
    label: string,
    withCopy: boolean,
  ) => {
    try {
      const files = await listFiles(item.id);
      const pdf = findFileOrThrow(files, kind, `No ${label} saved.`);
      const copyPath = withCopy
        ? findApplicationFile(files, APPLICATION_FILE.COVER_LETTER_TEXT)?.path
        : undefined;
      setViewer({
        title: `${label} — ${item.label}`,
        pdfUrl: await createJobApplicationObjectUrl(pdf.path),
        copyPath,
      });
    } catch (error) {
      reportError(error, `Failed to open ${label}`);
    }
  };

  const itemActions = (item: ApplicationItem): EllipsisAction[] => [
    {
      label: ACTION_LABEL.RESUME,
      onSelect: () => viewPdf(item, APPLICATION_FILE.RESUME, 'resume', false),
    },
    {
      label: ACTION_LABEL.COVER_LETTER,
      onSelect: () =>
        viewPdf(item, APPLICATION_FILE.COVER_LETTER_PDF, 'cover letter', true),
    },
    { label: ACTION_LABEL.FINDER, onSelect: () => openInFinder(item) },
  ];

  const copyCoverLetter = async (path: string) => {
    try {
      await navigator.clipboard.writeText(await readJobApplicationText(path));
      toast.success('Copied');
    } catch (error) {
      reportError(error, 'Failed to copy cover letter');
    }
  };

  const copy = useMemo(
    () => ({
      ...LIST_COPY,
      LIST: {
        ...LIST_COPY.LIST,
        EMPTY_MESSAGE: loaded ? LIST_COPY.LIST.EMPTY_MESSAGE : '',
      },
    }),
    [loaded],
  );

  return (
    <>
      <ExpansionContext.Provider
        value={{ actionsFor: itemActions, loadDetails }}
      >
        {loaded && (
          <CRUDItemList
            items={items}
            defaultExpandedIds={defaultExpandedIds}
            setItems={setItems}
            ListItemComponent={ApplicationRow}
            itemActions={itemActions}
            ExpandedComponent={ExpandedDetails}
            copy={copy}
            isCards
          />
        )}
      </ExpansionContext.Provider>
      <Dialog
        open={viewer !== null}
        onOpenChange={open => {
          if (!open) setViewer(null);
        }}
      >
        <DialogContent className="flex h-[85vh] max-w-4xl flex-col">
          <DialogHeader className="pr-8">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="min-w-0 truncate">
                {viewer?.title}
              </DialogTitle>
              {viewer?.copyPath && (
                <Button
                  variant="outline"
                  onClick={() => copyCoverLetter(viewer.copyPath as string)}
                >
                  <Copy size={14} /> Copy
                </Button>
              )}
            </div>
            <DialogDescription className="sr-only">
              Job application file
            </DialogDescription>
          </DialogHeader>
          {viewer?.pdfUrl && (
            <iframe
              src={viewer.pdfUrl}
              title={viewer.title}
              className="min-h-0 w-full flex-1 rounded border border-gray-200 dark:border-gray-700"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
