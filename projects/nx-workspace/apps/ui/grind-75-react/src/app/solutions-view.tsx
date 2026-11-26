import { useState } from 'react';
import { CheckboxCardGroup, Hyperlink } from '@vigilant-broccoli/react-lib';
import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

// DocsExplorer joins multi-selected contents with this separator.
const AGGREGATE_SEPARATOR = '\n\n---\n\n';

interface LanguageSolution {
  language: string;
  label: string;
  path: string;
  code: string;
}

interface QuestionInfo {
  type: string;
  technique: string;
  time: string;
  space: string;
  walkthrough: string;
  leetcode: string;
}

interface ProblemPayload {
  name: string;
  info?: QuestionInfo;
  languages: LanguageSolution[];
}

const parsePayloads = (content: string): ProblemPayload[] =>
  content.split(AGGREGATE_SEPARATOR).flatMap(chunk => {
    try {
      return [JSON.parse(chunk) as ProblemPayload];
    } catch {
      return [];
    }
  });

const DEFAULT_LANGUAGES = ['python'];
const LANGUAGE_SELECT_LABEL = 'Languages';
const NO_LANGUAGE_MESSAGE = 'Select a language to show solutions.';

const SolutionPanel = ({
  solution,
  className,
}: {
  solution: LanguageSolution;
  className: string;
}) => (
  <section
    className={`flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
  >
    <header className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {solution.label}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {solution.path}
      </p>
    </header>
    <pre className="flex-1 overflow-auto m-0 p-3 text-xs leading-relaxed bg-white dark:bg-gray-900">
      <code
        className="hljs"
        dangerouslySetInnerHTML={{
          __html: hljs.highlight(solution.code, { language: solution.language })
            .value,
        }}
      />
    </pre>
  </section>
);

// Walkthroughs chain steps with arrows; anything else reads as a sentence.
const STEP_SEPARATOR = ' -> ';

const BADGE_CLASS =
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium';
const NEUTRAL_BADGE_CLASS = `${BADGE_CLASS} bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200`;
const ACCENT_BADGE_CLASS = `${BADGE_CLASS} bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300`;
const COMPLEXITY_BADGE_CLASS = `${BADGE_CLASS} font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300`;

const Walkthrough = ({ text }: { text: string }) => {
  const steps = text.split(STEP_SEPARATOR);
  return steps.length > 1 ? (
    <ol className="m-0 pl-5 list-decimal flex flex-col gap-0.5 text-sm text-gray-800 dark:text-gray-200">
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  ) : (
    <p className="m-0 text-sm text-gray-800 dark:text-gray-200">{text}</p>
  );
};

const QuestionInfoRow = ({ info }: { info: QuestionInfo }) => (
  <div className="px-4 sm:px-6 pb-3 flex flex-col gap-2">
    {info.walkthrough && <Walkthrough text={info.walkthrough} />}
    <div className="flex flex-wrap items-center gap-1.5">
      {info.type && <span className={ACCENT_BADGE_CLASS}>{info.type}</span>}
      {info.technique && (
        <span className={NEUTRAL_BADGE_CLASS}>{info.technique}</span>
      )}
      {info.time && (
        <span className={COMPLEXITY_BADGE_CLASS} title="Time complexity">
          Time {info.time}
        </span>
      )}
      {info.space && (
        <span className={COMPLEXITY_BADGE_CLASS} title="Space complexity">
          Space {info.space}
        </span>
      )}
    </div>
  </div>
);

const COLUMN_CLASS = 'min-w-[28rem] w-[28rem] max-w-[90vw] shrink-0';

const ProblemSolutions = ({
  problem,
  selectedLanguages,
}: {
  problem: ProblemPayload;
  selectedLanguages: string[];
}) => {
  const solutions = problem.languages.filter(({ language }) =>
    selectedLanguages.includes(language),
  );

  return (
    <article className="flex flex-col flex-1 min-h-0">
      <h2 className="px-4 sm:px-6 pt-4 pb-2 pr-12 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {problem.info ? (
          <Hyperlink href={problem.info.leetcode}>{problem.name}</Hyperlink>
        ) : (
          problem.name
        )}
      </h2>
      {problem.info && <QuestionInfoRow info={problem.info} />}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden touch-pan-x flex gap-4 px-4 sm:px-6 pb-4">
        {solutions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {NO_LANGUAGE_MESSAGE}
          </p>
        ) : (
          solutions.map(solution => (
            <SolutionPanel
              key={solution.language}
              solution={solution}
              className={COLUMN_CLASS}
            />
          ))
        )}
      </div>
    </article>
  );
};

const SolutionsView = ({ content }: { content: string }) => {
  const [selectedLanguages, setSelectedLanguages] =
    useState<string[]>(DEFAULT_LANGUAGES);
  const problems = parsePayloads(content);
  const options = Array.from(
    new Map(
      problems.flatMap(({ languages }) =>
        languages.map(({ language, label }) => [language, label] as const),
      ),
    ),
    ([value, label]) => ({ value, label }),
  ).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 pt-4 pr-12 overflow-x-auto">
        <CheckboxCardGroup
          label={LANGUAGE_SELECT_LABEL}
          values={selectedLanguages}
          options={options}
          onChange={setSelectedLanguages}
        />
      </div>
      {problems.map(problem => (
        <ProblemSolutions
          key={problem.name}
          problem={problem}
          selectedLanguages={selectedLanguages}
        />
      ))}
    </div>
  );
};

export const renderSolutions = (content: string) => (
  <SolutionsView content={content} />
);
