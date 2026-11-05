'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, FileText, History, Pencil, Save } from 'lucide-react';
import {
  Button,
  CopyButton,
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
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { IS_DEMO } from '../constants/demo';
import { useTranslation } from '../i18n';
import { jobApplicationFileUrl } from '../utils/job-application-files.utils';
import { ResumeDiffComponent } from './resume-diff.component';

const MODE = {
  VIEW: 'view',
  PDF: 'pdf',
  EDIT: 'edit',
  HISTORY: 'history',
} as const;

type Mode = (typeof MODE)[keyof typeof MODE];

type Version = { id: string; createdAt: string; content: string };

type VersionOption = { id: string; label: string };

const ICON_SIZE = 14;

const readJson = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
};

type CoverLetterTabProps = {
  folder: string;
  // Renders the toolbar into this element, such as a tab row.
  toolbarSlot: HTMLElement | null;
};

export const CoverLetterTab = ({
  folder,
  toolbarSlot,
}: CoverLetterTabProps) => {
  const { t } = useTranslation();
  const url = `${API_ENDPOINTS.JOB_APPLICATIONS_COVER_LETTER}?path=${encodeURIComponent(folder)}`;
  const [mode, setMode] = useState<Mode>(MODE.VIEW);
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  // Bumped after each save so the iframe reloads the regenerated PDF.
  const [pdfRevision, setPdfRevision] = useState(0);
  const [fromId, setFromId] = useState<string>();
  const [toId, setToId] = useState<string>();
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch(url)
      .then(readJson)
      .then(data => {
        setVersions(data.versions);
        setFromId(
          current =>
            current ?? (data.versions.at(-2) ?? data.versions.at(-1))?.id,
        );
        setToId(data.versions.at(-1)?.id);
        setPdf(data.pdf);
        setSaved(data.content);
        setContent(data.content);
      })
      .catch(error =>
        toast.error(
          error instanceof Error ? error.message : t('CAREER.LOAD_FAILED'),
        ),
      );
  }, [url, t]);

  useEffect(load, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const data = await readJson(
        await fetch(url, {
          method: HTTP_METHOD.PUT,
          headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
          body: JSON.stringify({ content }),
        }),
      );
      setSaved(content);
      setPdfRevision(revision => revision + 1);
      if (data.pdfUpdated === false) toast.error(t('COVER_LETTER.PDF_FAILED'));
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
        label: t('RESUME.VERSION', { number: index + 1 }),
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

  const toolbar = (
    <div className="flex items-center gap-2">
      {mode === MODE.EDIT && (
        <Button
          onClick={save}
          loading={saving}
          disabled={IS_DEMO || content === saved || !content.trim()}
        >
          <Save size={ICON_SIZE} /> {t('CAREER.SAVE')}
        </Button>
      )}
      {mode === MODE.HISTORY && versions.length >= 2 && (
        <div className="flex items-center gap-2 text-sm">
          {versionSelect(t('RESUME.FROM'), fromId, setFromId)}
          {versionSelect(t('RESUME.TO'), toId, setToId)}
        </div>
      )}
      <CopyButton text={saved} />
      <SegmentedControl<Mode>
        label={t('COVER_LETTER.MODE')}
        value={mode}
        onChange={setMode}
        options={[
          {
            value: MODE.VIEW,
            label: t('COVER_LETTER.VIEW'),
            icon: <Eye size={ICON_SIZE} />,
          },
          {
            value: MODE.PDF,
            label: t('RESUME.PDF'),
            icon: <FileText size={ICON_SIZE} />,
          },
          {
            value: MODE.EDIT,
            label: t('COVER_LETTER.EDIT'),
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
    <div className="flex h-[70vh] min-h-0 flex-col gap-3">
      {toolbarSlot && createPortal(toolbar, toolbarSlot)}

      {mode === MODE.VIEW && (
        <p className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm">
          {saved}
        </p>
      )}

      {mode === MODE.PDF &&
        (pdf ? (
          <iframe
            src={`${jobApplicationFileUrl(pdf)}&v=${pdfRevision}`}
            title={t('RESUME.PDF')}
            className="min-h-0 flex-1 rounded-lg border"
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('COVER_LETTER.NO_PDF')}
          </p>
        ))}

      {mode === MODE.EDIT && (
        <Textarea
          readOnly={IS_DEMO}
          value={content}
          onChange={event => setContent(event.target.value)}
          spellCheck={false}
          className="min-h-[200px] flex-1 resize-none font-mono text-xs"
        />
      )}

      {mode === MODE.HISTORY &&
        (versions.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            {t('RESUME.NEED_TWO')}
          </p>
        ) : (
          <ResumeDiffComponent from={contentOf(fromId)} to={contentOf(toId)} />
        ))}
    </div>
  );
};
