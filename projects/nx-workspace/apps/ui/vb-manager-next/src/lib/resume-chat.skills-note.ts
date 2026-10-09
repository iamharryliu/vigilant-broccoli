export interface SkillsNote {
  skills: string[];
  skillsText: string;
  titles: string[];
}

const SECTION_HEADING = {
  SKILLS: 'Skills',
  ROLES: 'Roles',
} as const;

const SECTION_PREFIX = '## ';
const TABLE_ROW_PREFIX = '|';
const TABLE_SEPARATOR_PATTERN = /^\|[\s:|-]+\|$/;
const HEADER_ROW_COUNT = 1;
const FIRST_CELL_INDEX = 0;

const sectionLines = (markdown: string, heading: string): string[] => {
  const lines = markdown.split('\n');
  const start = lines.findIndex(
    line => line.trim() === `${SECTION_PREFIX}${heading}`,
  );
  if (start < 0) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => line.startsWith(SECTION_PREFIX));
  return (end < 0 ? rest : rest.slice(0, end)).map(line => line.trim());
};

const tableCells = (line: string): string[] =>
  line
    .slice(1, line.endsWith(TABLE_ROW_PREFIX) ? -1 : undefined)
    .split(TABLE_ROW_PREFIX)
    .map(cell => cell.trim());

const tableRows = (lines: string[]): string[][] =>
  lines
    .filter(
      line =>
        line.startsWith(TABLE_ROW_PREFIX) &&
        !TABLE_SEPARATOR_PATTERN.test(line),
    )
    .slice(HEADER_ROW_COUNT)
    .map(tableCells);

export const parseSkillsNote = (markdown: string): SkillsNote => {
  const skillRows = tableRows(sectionLines(markdown, SECTION_HEADING.SKILLS));
  const roleRows = tableRows(sectionLines(markdown, SECTION_HEADING.ROLES));
  return {
    skills: skillRows.map(cells => cells[FIRST_CELL_INDEX]).filter(Boolean),
    skillsText: skillRows.map(cells => cells.join(' ')).join(' '),
    titles: roleRows.map(cells => cells[FIRST_CELL_INDEX]).filter(Boolean),
  };
};
