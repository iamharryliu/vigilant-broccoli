'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, FileText, History, Pencil, RotateCcw, Save } from 'lucide-react';
import {
  Button,
  Callout,
  SegmentedControl,
  Select,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import type { ResumeData } from '@vigilant-broccoli/resume';
import { IS_DEMO } from '../constants/demo';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  CAREER_FILE_CHANGED_EVENT,
  CAREER_FILE_KIND,
} from '../constants/career';
import { validateCareerFile } from '../utils/career-file.utils';
import { useTranslation } from '../i18n';
import { CareerResetDialog } from './career-reset-dialog.component';
import { ResumeDiffComponent } from './resume-diff.component';
import { ResumeViewComponent } from './resume-view.component';

const MODE = {
  VIEW: 'view',
  PDF: 'pdf',
  EDIT: 'edit',
  HISTORY: 'history',
} as const;

type Mode = (typeof MODE)[keyof typeof MODE];

type Version = {
  id: string;
  createdAt: string;
  content: string;
  base?: boolean;
};

type VersionOption = { id: string; label: string };

const readJson = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

export type ResumeSource = {
  load: () => Promise<{ content: string; versions: Version[] }>;
  save: (content: string) => Promise<Response>;
};

const ICON_SIZE = 14;

const FLOATING_TOOLBAR_CLASS =
  'absolute right-0 top-0 z-10 rounded-lg bg-background/90 p-1 shadow-md backdrop-blur';

const RESUME_URL = `${API_ENDPOINTS.CAREER}?kind=${CAREER_FILE_KIND.RESUME}`;

const putJson = (url: string, content: string) =>
  fetch(url, {
    method: HTTP_METHOD.PUT,
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
    body: JSON.stringify({ content }),
  });

// Versions load first: reading them snapshots any out-of-band edit.
export const MASTER_RESUME_SOURCE: ResumeSource = {
  load: async () => {
    const { versions } = await readJson(
      await fetch(API_ENDPOINTS.RESUME_VERSIONS),
    );
    const { content } = await readJson(await fetch(RESUME_URL));
    return { content, versions };
  },
  save: content => putJson(RESUME_URL, content),
};

export const applicationResumeSource = (folder: string): ResumeSource => {
  const url = `${API_ENDPOINTS.JOB_APPLICATIONS_RESUME}?path=${encodeURIComponent(folder)}`;
  return {
    load: async () => readJson(await fetch(url)),
    save: content => putJson(url, content),
  };
};

const parseResume = (content: string): ResumeData | null => {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
};

type ResumeTabProps = {
  source: ResumeSource;
  // Offers resetting to a preset; only the master resume has one.
  resettable?: boolean;
  // Sits inside a card instead of filling the page.
  embedded?: boolean;
  // Renders the toolbar into this element, such as a tab row, instead of floating.
  toolbarSlot?: HTMLElement | null;
};

export const ResumeTab = ({
  source,
  resettable,
  embedded,
  toolbarSlot,
}: ResumeTabProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>(MODE.VIEW);
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [fromId, setFromId] = useState<string>();
  const [toId, setToId] = useState<string>();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const load = useCallback(() => {
    const failed = (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : t('CAREER.LOAD_FAILED'),
      );
    source
      .load()
      .then(({ content: loaded, versions: loadedVersions }) => {
        setVersions(loadedVersions);
        setFromId(
          current =>
            current ??
            loadedVersions.find(version => version.base)?.id ??
            loadedVersions.at(-2)?.id ??
            loadedVersions.at(-1)?.id,
        );
        setToId(loadedVersions.at(-1)?.id);
        setSaved(loaded);
        setContent(loaded);
        setServerErrors([]);
      })
      .catch(failed);
  }, [source, t]);

  useEffect(load, [load]);

  useEffect(() => {
    const reload = (event: Event) => {
      if ((event as CustomEvent<string>).detail === CAREER_FILE_KIND.RESUME)
        load();
    };
    window.addEventListener(CAREER_FILE_CHANGED_EVENT, reload);
    return () => window.removeEventListener(CAREER_FILE_CHANGED_EVENT, reload);
  }, [load]);

  const errors = useMemo(
    () => validateCareerFile(CAREER_FILE_KIND.RESUME, content),
    [content],
  );
  const resume = useMemo(
    () => (errors.length ? null : parseResume(content)),
    [errors, content],
  );

  // Renders the editor's current text, so unsaved edits preview too.
  useEffect(() => {
    if (mode !== MODE.PDF || errors.length) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    setPdfUrl(null);
    setPdfError(null);
    fetch(API_ENDPOINTS.CAREER_PREVIEW, {
      method: HTTP_METHOD.POST,
      headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
      body: JSON.stringify({ content }),
    })
      .then(async response => {
        if (!response.ok) throw new Error((await response.json()).error);
        return response.blob();
      })
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(error => {
        if (!cancelled)
          setPdfError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode, content, errors]);

  const save = async () => {
    setSaving(true);
    try {
      const response = await source.save(content);
      const data = await response.json();
      setServerErrors(data.errors ?? []);
      if (!response.ok) throw new Error(data.error);
      setSaved(content);
      if (data.pdfUpdated === false) toast.error(t('RESUME.PDF_FAILED'));
      else toast.success(t('CAREER.SAVED'));
      load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('CAREER.SAVE_FAILED'),
      );
    } finally {
      setSaving(false);
    }
  };

  const options = useMemo<VersionOption[]>(
    () =>
      versions.map((version, index) => ({
        id: version.id,
        label: t(version.base ? 'RESUME.BASE_VERSION' : 'RESUME.VERSION', {
          number: versions[0]?.base ? index : index + 1,
          date: new Date(version.createdAt).toLocaleString(),
        }),
      })),
    [versions, t],
  );
  const contentOf = (id?: string) =>
    versions.find(version => version.id === id)?.content ?? '';

  const versionSelect = (
    label: string,
    id: string | undefined,
    set: (id: string) => void,
  ) => (
    <label className="flex items-center gap-2">
      {label}
      <Select<VersionOption>
        value={options.find(option => option.id === id)}
        onValueChange={option => set(option.id)}
        options={options}
        optionDisplayKey="label"
        optionIdentifier="id"
        aria-label={label}
      />
    </label>
  );

  if (saved === null) return null;

  const shownErrors = errors.length ? errors : serverErrors;

  const padTop = toolbarSlot ? '' : 'pt-12';

  const toolbar = (
    <div
      className={`flex items-center gap-2 ${toolbarSlot ? '' : FLOATING_TOOLBAR_CLASS}`}
    >
      {mode === MODE.EDIT && (
        <>
          {resettable && (
            <Button
              variant="outline"
              disabled={IS_DEMO}
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw size={ICON_SIZE} /> {t('CAREER.RESET')}
            </Button>
          )}
          <Button
            onClick={save}
            loading={saving}
            disabled={IS_DEMO || content === saved || errors.length > 0}
          >
            <Save size={ICON_SIZE} /> {t('CAREER.SAVE')}
          </Button>
        </>
      )}
      {mode === MODE.HISTORY && versions.length >= 2 && (
        <div className="flex items-center gap-2 text-sm">
          {versionSelect(t('RESUME.FROM'), fromId, setFromId)}
          {versionSelect(t('RESUME.TO'), toId, setToId)}
        </div>
      )}
      <SegmentedControl<Mode>
        label={t('RESUME.MODE')}
        value={mode}
        onChange={setMode}
        options={[
          {
            value: MODE.VIEW,
            label: t('RESUME.VIEW'),
            icon: <Eye size={ICON_SIZE} />,
          },
          ...(IS_DEMO
            ? []
            : [
                {
                  value: MODE.PDF,
                  label: t('RESUME.PDF'),
                  icon: <FileText size={ICON_SIZE} />,
                },
              ]),
          {
            value: MODE.EDIT,
            label: t('RESUME.EDIT_JSON'),
            icon: <Pencil size={ICON_SIZE} />,
          },
          {
            value: MODE.HISTORY,
            label: t('RESUME.HISTORY'),
            icon: <History size={ICON_SIZE} />,
          },
        ]}
      />
    </div>
  );

  return (
    <div
      className={`relative flex min-h-0 flex-col gap-3 ${embedded ? 'h-[70vh]' : 'flex-1'}`}
    >
      {toolbarSlot ? createPortal(toolbar, toolbarSlot) : toolbar}

      {mode === MODE.VIEW &&
        (resume ? (
          <div className={`min-h-0 flex-1 overflow-y-auto ${padTop}`}>
            <ResumeViewComponent resume={resume} />
          </div>
        ) : (
          <Callout
            color="red"
            className={`${toolbarSlot ? '' : 'mt-12'} flex-col`}
          >
            <span>{t('RESUME.INVALID', { error: shownErrors[0] })}</span>
          </Callout>
        ))}

      {mode === MODE.PDF && (
        <div className={`flex min-h-0 flex-1 flex-col gap-3 ${padTop}`}>
          {errors.length > 0 || pdfError ? (
            <Callout color="red" className="flex-col">
              <span>
                {t('RESUME.PDF_PREVIEW_FAILED', {
                  error: pdfError ?? errors[0],
                })}
              </span>
            </Callout>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={t('RESUME.PDF')}
              className="min-h-0 flex-1 rounded-lg border"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('RESUME.PDF_RENDERING')}
            </p>
          )}
        </div>
      )}

      {mode === MODE.EDIT && (
        <div className={`flex min-h-0 flex-1 flex-col gap-3 ${padTop}`}>
          {shownErrors.length > 0 && (
            <Callout color="red" className="flex-col">
              <span>{t('CAREER.PROBLEMS')}</span>
              <ul className="list-disc pl-5">
                {shownErrors.map(error => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </Callout>
          )}
          <Textarea
            readOnly={IS_DEMO}
            value={content}
            onChange={event => setContent(event.target.value)}
            spellCheck={false}
            className="min-h-[200px] flex-1 resize-none font-mono text-xs"
          />
        </div>
      )}

      {mode === MODE.HISTORY && (
        <div className={`flex min-h-0 flex-1 flex-col gap-3 ${padTop}`}>
          {versions.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              {t('RESUME.NEED_TWO')}
            </p>
          ) : (
            <ResumeDiffComponent
              from={contentOf(fromId)}
              to={contentOf(toId)}
            />
          )}
        </div>
      )}

      {resettable && (
        <CareerResetDialog
          kind={CAREER_FILE_KIND.RESUME}
          label={t('NAV.RESUME')}
          open={resetOpen}
          onOpenChange={setResetOpen}
          onReset={load}
        />
      )}
    </div>
  );
};
