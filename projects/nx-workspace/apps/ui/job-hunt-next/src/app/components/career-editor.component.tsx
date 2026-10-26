'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Pencil, RotateCcw, Save } from 'lucide-react';
import {
  Button,
  Callout,
  SegmentedControl,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  CAREER_FILE_CHANGED_EVENT,
  CAREER_FILE_KIND,
  CareerFileKind,
} from '../constants/career';
import { toTab } from '../app.const';
import { CareerResetDialog } from './career-reset-dialog.component';
import { useTranslation } from '../i18n';
import { validateCareerExperience } from '../utils/career-experience.utils';

const VIEW = { EDIT: 'edit', PREVIEW: 'preview' } as const;

type View = (typeof VIEW)[keyof typeof VIEW];

const careerFileUrl = (kind: CareerFileKind) =>
  `${API_ENDPOINTS.CAREER}?kind=${kind}`;

// Fills the space under the toolbar; the floor keeps it usable in short windows.
const ICON_SIZE = 14;

const EDITOR_CLASS = 'min-h-[200px] flex-1 resize-none font-mono text-xs';

type FileEditorProps = {
  kind: CareerFileKind;
  // Live problems shown while typing; the server checks again on save.
  validate?: (content: string) => string[];
  preview?: boolean;
};

const FileEditor = ({ kind, validate, preview }: FileEditorProps) => {
  const { t } = useTranslation();
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>(VIEW.EDIT);
  const [resetOpen, setResetOpen] = useState(false);
  const label = t(toTab(kind).titleKey);

  const load = useCallback(() => {
    fetch(careerFileUrl(kind))
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setSaved(data.content);
        setContent(data.content);
        setServerErrors([]);
      })
      .catch(error =>
        toast.error(
          error instanceof Error ? error.message : t('CAREER.LOAD_FAILED'),
        ),
      );
  }, [kind, t]);

  useEffect(load, [load]);

  // An import run rewrites the file on the server when it finishes.
  useEffect(() => {
    const reload = (event: Event) => {
      if ((event as CustomEvent<CareerFileKind>).detail === kind) load();
    };
    window.addEventListener(CAREER_FILE_CHANGED_EVENT, reload);
    return () => window.removeEventListener(CAREER_FILE_CHANGED_EVENT, reload);
  }, [kind, load]);

  const liveErrors = useMemo(
    () => (validate ? validate(content) : []),
    [validate, content],
  );
  const errors = liveErrors.length ? liveErrors : serverErrors;

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(careerFileUrl(kind), {
        method: HTTP_METHOD.PUT,
        headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      setServerErrors(data.errors ?? []);
      if (!response.ok) throw new Error(data.error);
      setSaved(content);
      toast.success(t('CAREER.SAVED'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('CAREER.SAVE_FAILED'),
      );
    } finally {
      setSaving(false);
    }
  };

  if (saved === null) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-end gap-2">
        <div className="flex shrink-0 items-center gap-2">
          {preview && (
            <SegmentedControl<View>
              label={t('CAREER.VIEW_MODE')}
              value={view}
              onChange={setView}
              options={[
                {
                  value: VIEW.EDIT,
                  label: t('CAREER.EDIT'),
                  icon: <Pencil size={ICON_SIZE} />,
                },
                {
                  value: VIEW.PREVIEW,
                  label: t('CAREER.PREVIEW'),
                  icon: <Eye size={ICON_SIZE} />,
                },
              ]}
            />
          )}
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw size={ICON_SIZE} /> {t('CAREER.RESET')}
          </Button>
          <Button
            onClick={save}
            loading={saving}
            disabled={content === saved || liveErrors.length > 0}
          >
            <Save size={ICON_SIZE} /> {t('CAREER.SAVE')}
          </Button>
        </div>
      </div>
      {errors.length > 0 && (
        <Callout color="red" className="flex-col">
          <span>{t('CAREER.PROBLEMS')}</span>
          <ul className="list-disc pl-5">
            {errors.map(error => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Callout>
      )}
      {view === VIEW.PREVIEW ? (
        <div className="prose prose-sm min-h-0 max-w-none flex-1 overflow-y-auto dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={event => setContent(event.target.value)}
          spellCheck={false}
          className={EDITOR_CLASS}
        />
      )}
      <CareerResetDialog
        kind={kind}
        label={label}
        open={resetOpen}
        onOpenChange={setResetOpen}
        onReset={load}
      />
    </div>
  );
};

export const CareerExperienceEditor = () => (
  <FileEditor
    kind={CAREER_FILE_KIND.CAREER_EXPERIENCE}
    validate={validateCareerExperience}
    preview
  />
);

export const ResumeEditor = () => <FileEditor kind={CAREER_FILE_KIND.RESUME} />;
