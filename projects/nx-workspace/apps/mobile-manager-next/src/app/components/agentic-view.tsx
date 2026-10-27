'use client';

import { ExternalLink } from 'lucide-react';
import { AGENTIC_PHASES } from '../constants/agentic-workflows';

const LINK_ICON_SIZE = 16;

export const AgenticView = () => (
  <div className="flex flex-col gap-3 pb-4">
    {AGENTIC_PHASES.map(phase => (
      <section key={phase.name} className="flex flex-col gap-1">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {phase.name}
        </h2>
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900">
          {phase.workflows.map(workflow => (
            <li key={workflow.url}>
              <a
                href={workflow.url}
                target="_blank"
                rel="noopener noreferrer"
                title={workflow.summary}
                className="flex min-h-11 items-center gap-2 px-3 py-1.5 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-800"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {workflow.name}
                  </span>
                  <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {workflow.summary}
                  </span>
                </span>
                <ExternalLink
                  size={LINK_ICON_SIZE}
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground"
                />
              </a>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);
