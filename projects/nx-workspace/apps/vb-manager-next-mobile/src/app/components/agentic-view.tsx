'use client';

import { ExternalLink } from 'lucide-react';
import { AGENTIC_PHASES } from '../constants/agentic-workflows';

const NOTE =
  'Opens the workflow page on GitHub. Tap Run workflow there. This app never starts workflows itself.';
const OPEN_LABEL = 'Open in GitHub Actions';

const LINK_ICON_SIZE = 18;

export const AgenticView = () => (
  <div className="flex flex-col gap-5 pb-4">
    <p className="text-sm text-gray-600 dark:text-gray-400">{NOTE}</p>

    {AGENTIC_PHASES.map(phase => (
      <section key={phase.name} className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {phase.name}
        </h2>
        <ul className="flex flex-col gap-3">
          {phase.workflows.map(workflow => (
            <li
              key={workflow.url}
              className="flex w-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-1">
                <h3 className="break-words text-base font-semibold text-gray-900 dark:text-gray-100">
                  {workflow.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workflow.summary}
                </p>
              </div>
              <a
                href={workflow.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
              >
                {OPEN_LABEL}
                <ExternalLink size={LINK_ICON_SIZE} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);
