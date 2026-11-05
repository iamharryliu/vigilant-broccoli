const SECTION_PREFIX = '## ';
const PROJECT_PREFIX = '### ';
const TABLE_ROW_PREFIX = '|';
const PROJECT_METADATA_SEPARATOR = ' — ';
const PROJECT_METADATA_PARTS = 3;
const CONTRIBUTION_COLUMN = 'Contribution';
const TABLE_SEPARATOR_PATTERN = /^\|[\s:|-]+\|$/;
const LIST_SEPARATOR = '; ';
const JOB_EXPERIENCE_HEADING = 'Job Experience';

// The skill and the resume rules read these tables by heading and column, so
// a renamed heading or column silently drops facts from every run.
export const CAREER_SECTION = [
  { heading: 'Skills', columns: ['Skill', 'Used In'] },
  {
    heading: JOB_EXPERIENCE_HEADING,
    columns: ['Company', 'Role', 'Dates', 'Context'],
  },
  { heading: 'Project Contributions', columns: [] },
  { heading: 'Languages', columns: ['Language', 'Proficiency'] },
  { heading: 'Education', columns: ['Institution', 'Program', 'Dates'] },
] as const;

const tableCells = (line: string): string[] =>
  line
    .trim()
    .slice(1, line.trim().endsWith(TABLE_ROW_PREFIX) ? -1 : undefined)
    .split(TABLE_ROW_PREFIX)
    .map(cell => cell.trim());

const sectionLines = (lines: string[], heading: string): string[] | null => {
  const start = lines.findIndex(
    line => line.trim() === `${SECTION_PREFIX}${heading}`,
  );
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => line.startsWith(SECTION_PREFIX));
  return end < 0 ? rest : rest.slice(0, end);
};

const firstTableHeader = (lines: string[]) => {
  const header = lines.find(line => line.trim().startsWith(TABLE_ROW_PREFIX));
  return header ? tableCells(header) : null;
};

const sameColumns = (actual: string[], expected: readonly string[]) =>
  actual.length === expected.length &&
  expected.every((column, index) => actual[index] === column);

const validateProjects = (lines: string[]): string[] =>
  lines
    .join('\n')
    .split(new RegExp(`^${PROJECT_PREFIX}`, 'm'))
    .slice(1)
    .flatMap(block => {
      const [heading, ...rest] = block.split('\n');
      const errors: string[] = [];
      if (
        heading.split(PROJECT_METADATA_SEPARATOR).filter(part => part.trim())
          .length !== PROJECT_METADATA_PARTS
      ) {
        errors.push(
          `Project "${heading.trim()}" must be titled "Company — Project — Dates".`,
        );
      }
      if (firstTableHeader(rest)?.[0] !== CONTRIBUTION_COLUMN) {
        errors.push(
          `Project "${heading.trim()}" needs a table whose first column is "${CONTRIBUTION_COLUMN}".`,
        );
      }
      return errors;
    });

export const validateCareerExperience = (markdown: string): string[] => {
  const lines = markdown.split('\n');
  return CAREER_SECTION.flatMap(({ heading, columns }) => {
    const section = sectionLines(lines, heading);
    if (!section) return [`Missing "${SECTION_PREFIX}${heading}" section.`];
    if (!columns.length) return validateProjects(section);
    const header = firstTableHeader(section);
    return header && sameColumns(header, columns)
      ? []
      : [
          `"${SECTION_PREFIX}${heading}" needs a table with the columns ${columns.join(' | ')}.`,
        ];
  });
};

export type JobExperience = { company: string; titles: string[] };

// A Role cell lists the historical title first, then the other titles the
// resume may use, separated by `; `.
export const parseJobExperience = (markdown: string): JobExperience[] =>
  (sectionLines(markdown.split('\n'), JOB_EXPERIENCE_HEADING) ?? [])
    .map(line => line.trim())
    .filter(
      line =>
        line.startsWith(TABLE_ROW_PREFIX) &&
        !TABLE_SEPARATOR_PATTERN.test(line),
    )
    .slice(1)
    .map(tableCells)
    .filter(([company]) => company)
    .map(([company, role = '']) => ({
      company,
      titles: role
        .split(LIST_SEPARATOR)
        .map(title => title.trim())
        .filter(Boolean),
    }));
