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
import { Copy, FileText, Mail, Trash2, type LucideIcon } from 'lucide-react';
import {
  FILE_ENTRY_KIND,
  FileEntry,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
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
import { EXPAND_LATEST, EXPAND_PARAM } from '../app.const';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { useTranslation } from '../i18n';
import {
  APPLICATION_FILE,
  findApplicationFile,
  jobApplicationFileUrl,
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
const POSTING_TAB = { TEXT: 'text', GAPS: 'gaps' } as const;
const TITLE_SEPARATOR = ' · ';
const SECTION_HEADING_CLASS =
  'text-xs font-medium uppercase tracking-wide text-muted-foreground';

type ApplicationFileKind = Parameters<typeof findApplicationFile>[1];

type ApplicationItem = {
  id: string;
  title: string;
  label: string;
  date: string;
  created: string;
};

type Viewer = {
  title: string;
  pdfUrl: string;
  // Path of the plain-text cover letter, copied by the dialog's Copy button.
  copyPath?: string;
};

type ApplicationDetails = {
  description: JobDescription;
  // Null when the application has no gaps file (made before it existed).
  gaps: string[] | null;
};

type ItemAction = EllipsisAction & { icon: LucideIcon };

type ExpansionContextValue = {
  actionsFor: (item: ApplicationItem) => ItemAction[];
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
        {t('APPLICATIONS.NO_GAPS_FILE')}
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

const DescriptionView = ({ description }: { description: JobDescription }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {(description.role || description.company) && (
        <h2 className="text-lg font-semibold">
          {[description.role, description.company]
            .filter(Boolean)
            .join(TITLE_SEPARATOR)}
        </h2>
      )}
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

const ExpandedDetails = ({ item }: { item: ApplicationItem }) => {
  const { t } = useTranslation();
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
          setError(errorMessage(err, t('APPLICATIONS.DETAILS_FAILED'))),
      );
    return () => {
      cancelled = true;
    };
  }, [item, loadDetails, t]);

  return (
    <div className="flex gap-4 border-t border-border pt-3">
      <div className="flex w-36 shrink-0 flex-col gap-1 sm:w-44">
        {/* Actions that need a confirm step stay in the card's ellipsis menu,
            which shows it; these buttons run on click. */}
        {actionsFor(item)
          .filter(action => !action.confirm)
          .map(({ label, icon: Icon, onSelect }) => (
            <Button
              key={label}
              variant="ghost"
              className="justify-start"
              onClick={() => onSelect()}
            >
              <Icon size={14} />
              {label}
            </Button>
          ))}
      </div>
      {details ? (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Tabs defaultValue={POSTING_TAB.TEXT}>
            <TabsList>
              <TabsTrigger value={POSTING_TAB.TEXT}>
                {t('APPLICATIONS.TAB_POSTING')}
              </TabsTrigger>
              <TabsTrigger value={POSTING_TAB.GAPS}>
                {t('APPLICATIONS.TAB_GAPS')}
              </TabsTrigger>
            </TabsList>
            <AnimatedHeight>
              <TabsContent value={POSTING_TAB.TEXT} className="pt-3">
                <DescriptionView description={details.description} />
              </TabsContent>
              <TabsContent value={POSTING_TAB.GAPS} className="pt-3">
                <GapsList gaps={details.gaps} />
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

  return (
    <div
      className="overflow-hidden transition-[height] duration-200 ease-in-out motion-reduce:transition-none"
      style={{ height }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
};

const ApplicationRow = ({ item }: { item: ApplicationItem }) => (
  <span className="block truncate text-sm font-medium">{item.title}</span>
);

export const JobApplicationList = () => {
  const { t } = useTranslation();
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
        new URLSearchParams(window.location.search).get(EXPAND_PARAM) ===
        EXPAND_LATEST;
      if (wantsLatest && sorted.length) setDefaultExpandedIds([sorted[0].id]);
    } catch (error) {
      toast.error(errorMessage(error, t('APPLICATIONS.LOAD_FAILED')));
    } finally {
      setLoaded(true);
    }
  }, [t]);

  useEffect(() => {
    load();
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
      const [postingText, gapsText] = await Promise.all([
        readJobApplicationText(posting.path),
        gapsFile ? readJobApplicationText(gapsFile.path) : null,
      ]);
      return {
        description: parseJobDescription(splitPosting(postingText).body),
        gaps: gapsText === null ? null : parseGaps(gapsText),
      };
    },
    [t],
  );

  const viewPdf = async (
    item: ApplicationItem,
    kind: ApplicationFileKind,
    label: string,
    withCopy: boolean,
  ) => {
    const lowerLabel = label.toLowerCase();
    try {
      const files = await listFiles(item.id);
      const pdf = findFileOrThrow(
        files,
        kind,
        t('APPLICATIONS.NOT_SAVED', { label: lowerLabel }),
      );
      setViewer({
        title: `${label} — ${item.label}`,
        pdfUrl: jobApplicationFileUrl(pdf.path),
        copyPath: withCopy
          ? findApplicationFile(files, APPLICATION_FILE.COVER_LETTER_TEXT)?.path
          : undefined,
      });
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          t('APPLICATIONS.OPEN_FAILED', { label: lowerLabel }),
        ),
      );
    }
  };

  const itemActions = (item: ApplicationItem): ItemAction[] => [
    {
      label: t('APPLICATIONS.VIEW_RESUME'),
      icon: FileText,
      onSelect: () =>
        viewPdf(item, APPLICATION_FILE.RESUME, t('APPLICATIONS.RESUME'), false),
    },
    {
      label: t('APPLICATIONS.VIEW_COVER_LETTER'),
      icon: Mail,
      onSelect: () =>
        viewPdf(
          item,
          APPLICATION_FILE.COVER_LETTER_PDF,
          t('APPLICATIONS.COVER_LETTER'),
          true,
        ),
    },
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

  const copyCoverLetter = async (path: string) => {
    try {
      await navigator.clipboard.writeText(await readJobApplicationText(path));
      toast.success(t('APPLICATIONS.COPIED'));
    } catch (error) {
      toast.error(errorMessage(error, t('APPLICATIONS.COPY_FAILED')));
    }
  };

  const copy = useMemo(
    () => ({
      LIST: {
        TITLE: '',
        EMPTY_MESSAGE: loaded ? t('APPLICATIONS.EMPTY') : '',
      },
      CREATE: { TITLE: '', DESCRIPTION: '' },
      UPDATE: { TITLE: '', DESCRIPTION: '' },
    }),
    [loaded, t],
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
        <DialogContent className="flex h-[95vh] w-[95vw] max-w-none flex-col">
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
                  <Copy size={14} /> {t('APPLICATIONS.COPY')}
                </Button>
              )}
            </div>
            <DialogDescription className="sr-only">
              {t('APPLICATIONS.FILE_DESCRIPTION')}
            </DialogDescription>
          </DialogHeader>
          {viewer && (
            <iframe
              src={viewer.pdfUrl}
              title={viewer.title}
              className="min-h-0 w-full flex-1 rounded border border-border"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
