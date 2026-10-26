'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Button,
  Callout,
  SegmentedControl,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { CAREER_FILE_KIND, CareerFileKind } from '../constants/career';
import { useTranslation } from '../i18n';
import { validateCareerExperience } from '../utils/career-experience.utils';

const VIEW = { EDIT: 'edit', PREVIEW: 'preview' } as const;

type View = (typeof VIEW)[keyof typeof VIEW];

const careerFileUrl = (kind: CareerFileKind) =>
  `${API_ENDPOINTS.CAREER}?kind=${kind}`;

const EDITOR_CLASS = 'min-h-[60vh] font-mono text-xs';

type FileEditorProps = {
  kind: CareerFileKind;
  hint: string;
  // Live problems shown while typing; the server checks again on save.
  validate?: (content: string) => string[];
  preview?: boolean;
};

const FileEditor = ({ kind, hint, validate, preview }: FileEditorProps) => {
  const { t } = useTranslation();
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [path, setPath] = useState('');
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>(VIEW.EDIT);

  useEffect(() => {
    fetch(careerFileUrl(kind))
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setSaved(data.content);
        setContent(data.content);
        setPath(data.path);
      })
      .catch(error =>
        toast.error(
          error instanceof Error ? error.message : t('CAREER.LOAD_FAILED'),
        ),
      );
  }, [kind, t]);

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
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{hint}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs text-muted-foreground">
          {t('CAREER.FILE_LOCATION', { path })}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {preview && (
            <SegmentedControl<View>
              label={t('CAREER.VIEW_MODE')}
              value={view}
              onChange={setView}
              options={[
                { value: VIEW.EDIT, label: t('CAREER.EDIT') },
                { value: VIEW.PREVIEW, label: t('CAREER.PREVIEW') },
              ]}
            />
          )}
          <Button
            onClick={save}
            loading={saving}
            disabled={content === saved || liveErrors.length > 0}
          >
            {t('CAREER.SAVE')}
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
        <div className="prose prose-sm max-w-none dark:prose-invert">
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
    </div>
  );
};

export const CareerEditor = () => {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue={CAREER_FILE_KIND.CAREER_EXPERIENCE}>
      <TabsList>
        <TabsTrigger value={CAREER_FILE_KIND.CAREER_EXPERIENCE}>
          {t('CAREER.TAB_CAREER_EXPERIENCE')}
        </TabsTrigger>
        <TabsTrigger value={CAREER_FILE_KIND.RESUME}>
          {t('CAREER.TAB_RESUME')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value={CAREER_FILE_KIND.CAREER_EXPERIENCE} className="pt-3">
        <FileEditor
          kind={CAREER_FILE_KIND.CAREER_EXPERIENCE}
          hint={t('CAREER.CAREER_EXPERIENCE_HINT')}
          validate={validateCareerExperience}
          preview
        />
      </TabsContent>
      <TabsContent value={CAREER_FILE_KIND.RESUME} className="pt-3">
        <FileEditor
          kind={CAREER_FILE_KIND.RESUME}
          hint={t('CAREER.RESUME_HINT')}
        />
      </TabsContent>
    </Tabs>
  );
};
