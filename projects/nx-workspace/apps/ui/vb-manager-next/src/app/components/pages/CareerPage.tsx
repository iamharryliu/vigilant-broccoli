'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Textarea } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { Tabs } from '@radix-ui/themes';
import { DownloadIcon } from '@radix-ui/react-icons';
import { ResumeViewComponent } from '../resume-view.component';
import { resumeData, ResumeData } from '@vigilant-broccoli/resume';
import { authFetch } from '../../../../libs/auth';

const EDITOR_TAB = {
  JSON: 'json',
  AI: 'ai',
} as const;

type EditorTab = (typeof EDITOR_TAB)[keyof typeof EDITOR_TAB];

const INITIAL_JSON_TEXT = JSON.stringify(resumeData, null, 2);

const RESUME_API_PATH = '/api/resume';
const SAVE_DEBOUNCE_MS = 500;

const TOAST_MESSAGE = {
  FAILED: 'Failed to save resume.json',
  LOAD_FAILED: 'Failed to load resume.json',
} as const;

const DEFAULT_JSON_ERROR = 'Invalid JSON';

export const CareerPage = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>(EDITOR_TAB.JSON);
  const [jsonText, setJsonText] = useState(INITIAL_JSON_TEXT);
  const [resume, setResume] = useState<ResumeData>(resumeData);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const hasEditedRef = useRef(false);

  const handleJsonChange = (value: string) => {
    hasEditedRef.current = true;
    setJsonText(value);
    try {
      setResume(JSON.parse(value) as ResumeData);
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : DEFAULT_JSON_ERROR);
    }
  };

  useEffect(() => {
    authFetch(RESUME_API_PATH)
      .then(response => (response.ok ? response.json() : Promise.reject()))
      .then(
        ({ content }) => {
          setJsonText(content);
          setResume(JSON.parse(content) as ResumeData);
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

  return (
    <div className="flex flex-col h-full print:block">
      <div className="flex flex-1 min-h-0 print:block">
        <div className="flex-1 min-w-0 print:hidden">
          <Tabs.Root
            value={activeTab}
            onValueChange={value => setActiveTab(value as EditorTab)}
            className="h-full flex flex-col"
          >
            <div className="flex items-center justify-between">
              <Tabs.List>
                <Tabs.Trigger value={EDITOR_TAB.JSON}>Edit JSON</Tabs.Trigger>
                <Tabs.Trigger value={EDITOR_TAB.AI}>AI Chat</Tabs.Trigger>
              </Tabs.List>
              <Button onClick={() => window.print()}>
                <DownloadIcon /> Download PDF
              </Button>
            </div>

            <Tabs.Content
              value={EDITOR_TAB.JSON}
              className="pt-3 flex-1 min-h-0 flex flex-col"
            >
              <Textarea
                value={jsonText}
                onChange={event => handleJsonChange(event.target.value)}
                spellCheck={false}
                className="flex-1 min-h-0 font-mono text-xs resize-none"
              />
              {jsonError && (
                <p className="text-xs text-red-600 mt-1">{jsonError}</p>
              )}
            </Tabs.Content>

            <Tabs.Content value={EDITOR_TAB.AI} className="pt-3 flex-1 min-h-0">
              <p className="text-sm text-muted-foreground">
                AI chat editing is coming soon.
              </p>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <div className="shrink-0 overflow-y-auto print:overflow-visible print:w-full">
          <ResumeViewComponent resume={resume} />
        </div>
      </div>
    </div>
  );
};
