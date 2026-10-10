'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { DownloadIcon } from '@radix-ui/react-icons';
import { ResumeViewComponent } from '../resume-view.component';
import { ResumeDiffComponent } from '../resume-diff.component';
import { ResumeChatPanel } from '../resume-chat-panel.component';
import {
  resumeData,
  ResumeData,
  validateResume,
} from '@vigilant-broccoli/resume';
import { authFetch } from '../../../../libs/auth';
import { useResumeChat } from '../../hooks/useResumeChat';

const EDITOR_TAB = {
  JSON: 'json',
  AI: 'ai',
  DIFF: 'diff',
} as const;

type EditorTab = (typeof EDITOR_TAB)[keyof typeof EDITOR_TAB];

const INITIAL_JSON_TEXT = JSON.stringify(resumeData, null, 2);

const RESUME_API_PATH = '/api/resume';
const RESUME_BASELINE_API_PATH = '/api/resume/baseline';
const RESUME_PDF_API_PATH = '/api/resume/pdf';
const RESUME_PDF_FILENAME = 'resume.pdf';
const SAVE_DEBOUNCE_MS = 500;

const TOAST_MESSAGE = {
  FAILED: 'Failed to save resume.json',
  LOAD_FAILED: 'Failed to load resume.json',
  DOWNLOAD_FAILED: 'Failed to download resume PDF',
} as const;

const DEFAULT_JSON_ERROR = 'Invalid JSON';
const SCHEMA_ERROR_SEPARATOR = '; ';
const MAX_SCHEMA_ERRORS_SHOWN = 3;

const parseResumeText = (
  text: string,
): { resume: ResumeData } | { error: string } => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : DEFAULT_JSON_ERROR,
    };
  }
  const validation = validateResume(parsed);
  return validation.ok
    ? { resume: validation.resume }
    : {
        error: validation.errors
          .slice(0, MAX_SCHEMA_ERRORS_SHOWN)
          .join(SCHEMA_ERROR_SEPARATOR),
      };
};

const readDownloadError = async (response: Response): Promise<string> => {
  const body = await response.json().catch(() => undefined);
  return typeof body?.error === 'string'
    ? body.error
    : TOAST_MESSAGE.DOWNLOAD_FAILED;
};

export const CareerPage = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>(EDITOR_TAB.JSON);
  const [jsonText, setJsonText] = useState(INITIAL_JSON_TEXT);
  const [resume, setResume] = useState<ResumeData>(resumeData);
  const [originalJsonText, setOriginalJsonText] = useState(INITIAL_JSON_TEXT);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasEditedRef = useRef(false);
  const revisionRef = useRef(0);

  const commitResume = (nextResume: ResumeData): number => {
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setResume(nextResume);
    return revisionRef.current;
  };

  const handleJsonChange = (value: string) => {
    hasEditedRef.current = true;
    setJsonText(value);
    const parsed = parseResumeText(value);
    if ('error' in parsed) {
      setJsonError(parsed.error);
      return;
    }
    commitResume(parsed.resume);
    setJsonError(null);
  };

  useEffect(() => {
    authFetch(RESUME_BASELINE_API_PATH)
      .then(response => (response.ok ? response.json() : Promise.reject()))
      .then(
        ({ content }) => setOriginalJsonText(content),
        () => undefined,
      );
  }, []);

  useEffect(() => {
    authFetch(RESUME_API_PATH)
      .then(response => (response.ok ? response.json() : Promise.reject()))
      .then(
        ({ content }) => {
          if (hasEditedRef.current) return;
          const parsed = parseResumeText(content);
          if ('error' in parsed) {
            toast.error(`${TOAST_MESSAGE.LOAD_FAILED}: ${parsed.error}`);
            return;
          }
          setJsonText(content);
          commitResume(parsed.resume);
        },
        () => toast.error(TOAST_MESSAGE.LOAD_FAILED),
      );
  }, []);

  useEffect(() => {
    if (!hasEditedRef.current || jsonError) return;

    const timeoutId = setTimeout(() => {
      authFetch(RESUME_API_PATH, {
        method: 'PUT',
        body: JSON.stringify({ content: jsonText }),
      }).then(
        response => {
          if (!response.ok) toast.error(TOAST_MESSAGE.FAILED);
        },
        () => toast.error(TOAST_MESSAGE.FAILED),
      );
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [jsonText, jsonError]);

  const handleApplyResume = (nextResume: ResumeData): number => {
    hasEditedRef.current = true;
    setJsonText(JSON.stringify(nextResume, null, 2));
    setJsonError(null);
    return commitResume(nextResume);
  };

  const chat = useResumeChat({
    resume,
    revision,
    canApply: !jsonError,
    onApplyResume: handleApplyResume,
  });

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const response = await authFetch(RESUME_PDF_API_PATH, {
        method: 'POST',
        body: JSON.stringify({ resume }),
      });
      if (!response.ok) {
        toast.error(await readDownloadError(response));
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = RESUME_PDF_FILENAME;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(TOAST_MESSAGE.DOWNLOAD_FAILED);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full print:block">
      <div className="flex flex-1 min-h-0 print:block">
        <div className="flex-1 min-w-0 print:hidden">
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as EditorTab)}
            className="h-full flex flex-col"
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value={EDITOR_TAB.JSON}>Edit JSON</TabsTrigger>
                <TabsTrigger value={EDITOR_TAB.AI}>AI Chat</TabsTrigger>
                <TabsTrigger value={EDITOR_TAB.DIFF}>Diff</TabsTrigger>
              </TabsList>
              <Button
                onClick={handleDownloadPdf}
                disabled={!!jsonError || isDownloading}
              >
                <DownloadIcon /> Download PDF
              </Button>
            </div>

            <TabsContent
              value={EDITOR_TAB.JSON}
              className="pt-3 flex-1 min-h-0"
            >
              <div className="h-full flex flex-col">
                <Textarea
                  value={jsonText}
                  onChange={event => handleJsonChange(event.target.value)}
                  spellCheck={false}
                  className="flex-1 min-h-0 font-mono text-xs resize-none"
                />
                {jsonError && (
                  <p className="text-xs text-red-600 mt-1">{jsonError}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value={EDITOR_TAB.AI} className="pt-3 flex-1 min-h-0">
              <ResumeChatPanel
                messages={chat.messages}
                isLoading={chat.isLoading}
                revision={revision}
                canApply={!jsonError}
                onSend={chat.send}
                onApply={chat.apply}
                onReset={chat.reset}
              />
            </TabsContent>

            <TabsContent
              value={EDITOR_TAB.DIFF}
              className="pt-3 flex-1 min-h-0"
            >
              <ResumeDiffComponent
                original={originalJsonText}
                current={jsonText}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="shrink-0 overflow-y-auto print:overflow-visible print:w-full">
          <ResumeViewComponent resume={resume} />
        </div>
      </div>
    </div>
  );
};
