'use client';

import { MarkdownViewer } from '@vigilant-broccoli/docs-explorer';
import workflowNote from '@notes/life-skills/career/job-hunt-workflow.md';
import { APP_TAB } from '../app.const';
import { useTabTitle } from '../use-page-title';

export default function Page() {
  useTabTitle(APP_TAB.WORKFLOW);
  return <MarkdownViewer content={workflowNote} />;
}
