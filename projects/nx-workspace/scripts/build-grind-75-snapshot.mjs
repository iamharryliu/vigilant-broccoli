import fs from 'fs';
import path from 'path';

const LANGUAGES = [
  { id: 'csharp', label: 'C#', dir: 'csharp', ext: '.cs', isPascalCase: true },
  { id: 'go', label: 'Go', dir: 'go', ext: '.go' },
  { id: 'java', label: 'Java', dir: 'java', ext: '.java', isPascalCase: true },
  { id: 'python', label: 'Python', dir: 'python', ext: '.py' },
  { id: 'typescript', label: 'TypeScript', dir: 'typescript', ext: '.ts' },
];

// Which language's category folder names a problem's category, first match wins.
const CATEGORY_SOURCE_ORDER = ['python', 'go', 'typescript', 'java', 'csharp'];

const PATH_SEP = '/';
const NODE_TYPE_FILE = 'file';
const NODE_TYPE_DIRECTORY = 'directory';
const NOTES_DIR = 'notes';
const STRUCTURE_FILE = 'structure.json';
const SEARCH_INDEX_FILE = 'search-index.json';

const EXCLUDED_DIRS = new Set([
  'test',
  'tests',
  'node_modules',
  '__pycache__',
  'dist',
  // Java and C# keep shared ListNode/TreeNode helpers here.
  'common',
]);
const EXCLUDED_FILES = new Set(['__init__.py', 'common.py', 'common.ts']);
const EXCLUDED_FILE_RE = /(_test\.go|\.test\.ts|\.spec\.ts|\.d\.ts)$/;

// Category folders differ per language; keys are the slug after
// `slugify`, values the shared slug.
const CATEGORY_ALIASES = {
  arrays: 'array',
  string_lc_questions: 'string',
  mathematics: 'math',
};

// Known filename mismatches across languages (slugified source -> canonical).
const PROBLEM_ALIASES = {
  'first-bad-verison': 'first-bad-version',
  'minumum-window-substring': 'minimum-window-substring',
  'maximum-depth-of-bt': 'maximum-depth-of-binary-tree',
  'invert-binary-tree': 'invert-bt',
  'valid-parentheses': 'valid-parenthesis',
};

const CATEGORY_LABELS = { hashmap: 'Hash Map' };

const WORD_LABELS = {
  bt: 'Binary Tree',
  lru: 'LRU',
  search2: 'Search II',
  robber2: 'Robber II',
  bst: 'BST',
  ii: 'II',
  iv: 'IV',
  '2d': '2D',
  a2d: 'a 2D',
  kgroup: 'K-Group',
  kfrequent: 'K Frequent',
  o1: 'O(1)',
  getrandom: 'GetRandom',
  asorted: 'a Sorted',
  of: 'of',
  in: 'in',
  to: 'to',
  and: 'and',
  from: 'from',
  with: 'with',
  using: 'using',
  by: 'by',
  the: 'the',
  a: 'a',
};

const slugify = name =>
  name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

const toWords = slug =>
  slug
    .split('-')
    .filter(Boolean)
    .map(
      word => WORD_LABELS[word] ?? word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');

const categorySlug = dirName => {
  const underscored = dirName.toLowerCase().replace(/-/g, '_');
  const aliased = CATEGORY_ALIASES[underscored] ?? underscored;
  return aliased.replace(/_/g, '-');
};

// Java and C# name files after the class (TwoSum.java), so split the words
// before slugifying; other languages already separate them with `_` or `-`.
const PASCAL_WORD_BOUNDARY_RE = /([a-z0-9])([A-Z])/g;

const problemSlug = (fileName, language) => {
  const slug = slugify(
    language?.isPascalCase
      ? fileName.replace(PASCAL_WORD_BOUNDARY_RE, '$1-$2')
      : fileName,
  );
  return PROBLEM_ALIASES[slug] ?? slug;
};

const isSolution = (fileName, ext) =>
  fileName.endsWith(ext) &&
  !EXCLUDED_FILES.has(fileName) &&
  !EXCLUDED_FILE_RE.test(fileName);

const listDir = dir =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

// Go keeps one problem per folder (go/array/two_sum/two_sum.go); python and
// typescript keep one file per problem directly in the category folder.
const collectSolutions = (root, language) => {
  const langRoot = path.join(root, language.dir);
  const found = [];
  for (const category of listDir(langRoot)) {
    if (!category.isDirectory() || EXCLUDED_DIRS.has(category.name)) continue;
    const categoryDir = path.join(langRoot, category.name);
    const addFile = (dir, fileName) => {
      if (!isSolution(fileName, language.ext)) return;
      found.push({
        language,
        category: category.name,
        fileName,
        abs: path.join(dir, fileName),
      });
    };
    for (const entry of listDir(categoryDir)) {
      if (entry.isFile()) addFile(categoryDir, entry.name);
      else if (entry.isDirectory() && !EXCLUDED_DIRS.has(entry.name)) {
        const problemDir = path.join(categoryDir, entry.name);
        for (const inner of listDir(problemDir)) {
          if (inner.isFile()) addFile(problemDir, inner.name);
        }
      }
    }
  }
  return found;
};

const buildProblems = (root, repoRoot) => {
  const problems = new Map();
  const solutions = LANGUAGES.flatMap(language =>
    collectSolutions(root, language),
  );
  for (const solution of solutions) {
    const slug = problemSlug(solution.fileName, solution.language);
    const problem = problems.get(slug) ?? { slug, solutions: [] };
    problem.solutions.push({
      ...solution,
      categorySlug: categorySlug(solution.category),
    });
    problems.set(slug, problem);
  }

  const conflicts = [];
  const result = [...problems.values()].map(problem => {
    const byLanguage = LANGUAGES.map(language => {
      const match = problem.solutions.find(s => s.language.id === language.id);
      if (!match) return null;
      return {
        language: language.id,
        label: language.label,
        path: path.relative(repoRoot, match.abs).split(path.sep).join(PATH_SEP),
        code: fs.readFileSync(match.abs, 'utf8'),
      };
    }).filter(Boolean);

    // Python's category is the reference; go and typescript only fill in
    // problems python lacks.
    const chosen = CATEGORY_SOURCE_ORDER.map(id =>
      problem.solutions.find(s => s.language.id === id),
    ).find(Boolean);
    const categories = new Set(problem.solutions.map(s => s.categorySlug));
    if (categories.size > 1) {
      conflicts.push(
        `${problem.slug}: ${[...categories].join(', ')} -> ${chosen.categorySlug}`,
      );
    }
    return {
      category:
        CATEGORY_LABELS[chosen.categorySlug] ?? toWords(chosen.categorySlug),
      slug: problem.slug,
      name: toWords(problem.slug),
      languages: byLanguage,
    };
  });
  return { problems: result, conflicts };
};

const sortNodes = nodes =>
  nodes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(node =>
      node.children ? { ...node, children: sortNodes(node.children) } : node,
    );

const buildTree = problems => {
  const categories = new Map();
  for (const problem of problems) {
    const children = categories.get(problem.category) ?? [];
    children.push({
      name: problem.name,
      path: `${problem.category}${PATH_SEP}${problem.name}`,
      type: NODE_TYPE_FILE,
    });
    categories.set(problem.category, children);
  }
  return sortNodes(
    [...categories].map(([category, children]) => ({
      name: category,
      path: category,
      type: NODE_TYPE_DIRECTORY,
      children,
    })),
  );
};

const [, , configPath] = process.argv;
if (!configPath) {
  console.error('Usage: node build-grind-75-snapshot.mjs <config.json>');
  process.exit(1);
}
const configDir = path.dirname(path.resolve(configPath));
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const root = path.resolve(configDir, config.root);
const outDir = path.resolve(configDir, config.outDir);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`Invalid root directory: ${root}`);
  process.exit(1);
}
// Repo-relative paths in the payload: root is <repo>/projects/grind-75.
const repoRoot = path.resolve(root, '..', '..');

const { problems, conflicts } = buildProblems(root, repoRoot);
for (const conflict of conflicts) console.log(`category conflict: ${conflict}`);

const TABLE_ROW_RE = /^\|\s*\d+\s*\|/;
// Cells may contain `\|`, so split only on unescaped pipes.
const CELL_SPLIT_RE = /(?<!\\)\|/;
const QUESTION_LINK_RE = /\[([^\]]+)\]\([^)]*[?&]file=([^)&]+)[^)]*\)/;
const LEETCODE_LINK_RE = /<([^>]+)>/;
const unescapeCell = cell => cell.trim().replace(/\\\|/g, '|');

// Rows are matched to problems by the file name in the question link, since
// the displayed question names differ from the solution file names.
const buildQuestionInfo = notePath => {
  const info = new Map();
  const lines = fs
    .readFileSync(path.join(repoRoot, notePath), 'utf8')
    .split('\n')
    .filter(line => TABLE_ROW_RE.test(line));
  for (const line of lines) {
    const cells = line.split(CELL_SPLIT_RE).slice(1, -1).map(unescapeCell);
    const [, question, type, technique, time, space, walkthrough, link] = cells;
    const linkMatch = question.match(QUESTION_LINK_RE);
    if (!linkMatch) continue;
    const fileName = decodeURIComponent(linkMatch[2]).split(PATH_SEP).pop();
    info.set(problemSlug(fileName), {
      question: linkMatch[1],
      type,
      technique,
      time,
      space,
      walkthrough,
      leetcode: link.match(LEETCODE_LINK_RE)?.[1] ?? link,
    });
  }
  return info;
};

if (config.questionTable) {
  const questionInfo = buildQuestionInfo(config.questionTable);
  for (const problem of problems) {
    // Source files abbreviate some names (e.g. `bt`), which only the
    // expanded display name matches.
    const key = [problem.slug, slugify(problem.name)].find(candidate =>
      questionInfo.has(candidate),
    );
    problem.info = questionInfo.get(key);
    questionInfo.delete(key);
  }
  for (const slug of questionInfo.keys())
    console.log(`unmatched question row: ${slug}`);
}

// Markdown notes shown at the explorer root, as raw markdown rather than the
// JSON payload problems use; config paths are repo-relative.
const rootNotes = (config.rootNotes ?? []).map(notePath => ({
  name: toWords(slugify(path.basename(notePath))),
  content: fs.readFileSync(path.join(repoRoot, notePath), 'utf8'),
}));

const notesOut = path.join(outDir, NOTES_DIR);
fs.rmSync(notesOut, { recursive: true, force: true });
for (const problem of problems) {
  const dest = path.join(notesOut, problem.category, problem.name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(
    dest,
    JSON.stringify({
      name: problem.name,
      info: problem.info,
      languages: problem.languages,
    }),
  );
}

for (const note of rootNotes) {
  fs.mkdirSync(notesOut, { recursive: true });
  fs.writeFileSync(path.join(notesOut, note.name), note.content);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, STRUCTURE_FILE),
  JSON.stringify(
    sortNodes([
      ...buildTree(problems),
      ...rootNotes.map(note => ({
        name: note.name,
        path: note.name,
        type: NODE_TYPE_FILE,
      })),
    ]),
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(outDir, SEARCH_INDEX_FILE),
  JSON.stringify([
    ...problems.map(problem => ({
      name: problem.name,
      path: `${problem.category}${PATH_SEP}${problem.name}`,
      content: problem.languages.map(l => l.code).join('\n\n'),
    })),
    ...rootNotes.map(note => ({
      name: note.name,
      path: note.name,
      content: note.content,
    })),
  ]),
);

console.log(`Wrote snapshot: ${problems.length} problems -> ${outDir}`);
