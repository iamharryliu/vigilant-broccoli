import hljs from 'highlight.js/lib/core';
import go from 'highlight.js/lib/languages/go';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('go', go);
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

interface ProblemPayload {
  name: string;
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

const SolutionColumn = ({ solution }: { solution: LanguageSolution }) => (
  <section className="flex flex-col min-w-[28rem] w-[28rem] max-w-[90vw] shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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

const ProblemSolutions = ({ problem }: { problem: ProblemPayload }) => (
  <article className="flex flex-col h-full min-h-0">
    <h2 className="px-4 sm:px-6 pt-4 pb-2 pr-12 text-lg font-semibold text-gray-900 dark:text-gray-100">
      {problem.name}
    </h2>
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden touch-pan-x flex gap-4 px-4 sm:px-6 pb-4">
      {problem.languages.map(solution => (
        <SolutionColumn key={solution.language} solution={solution} />
      ))}
    </div>
  </article>
);

export const renderSolutions = (content: string) => (
  <div className="flex flex-col h-full">
    {parsePayloads(content).map(problem => (
      <ProblemSolutions key={problem.name} problem={problem} />
    ))}
  </div>
);
