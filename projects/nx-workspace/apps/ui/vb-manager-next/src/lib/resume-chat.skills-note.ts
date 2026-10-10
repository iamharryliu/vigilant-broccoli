export interface JobExperience {
  company: string;
  role: string;
  dates: string;
  context: string;
}

export interface SkillsNote {
  skills: string[];
  skillUsage: SkillUsage[];
  titles: string[];
  experience: JobExperience[];
  contributions: ProjectContribution[];
  languages: string[];
}

export interface SkillUsage {
  skill: string;
  companies: string[];
}

export interface ProjectContribution {
  project: string;
  company: string;
  dates: string;
  contribution: string;
  description: string;
}

const SECTION_HEADING = {
  SKILLS: 'Skills',
  ROLES: 'Roles',
  LANGUAGES: 'Languages',
  JOB_EXPERIENCE: 'Job Experience',
  PROJECT_CONTRIBUTIONS: 'Project Contributions',
} as const;

const SECTION_PREFIX = '## ';
const TABLE_ROW_PREFIX = '|';
const TABLE_SEPARATOR_PATTERN = /^\|[\s:|-]+\|$/;
const HEADER_ROW_COUNT = 1;
const FIRST_CELL_INDEX = 0;
const LANGUAGE_PROFICIENCY_SEPARATOR = ': ';
const PROJECT_HEADING_PATTERN = /^### /m;
const PROJECT_METADATA_SEPARATOR = ' — ';
const USED_IN_SEPARATOR = '; ';

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

const projectContributions = (markdown: string): ProjectContribution[] =>
  sectionLines(markdown, SECTION_HEADING.PROJECT_CONTRIBUTIONS)
    .join('\n')
    .split(PROJECT_HEADING_PATTERN)
    .slice(1)
    .flatMap(section => {
      const [heading, ...lines] = section.split('\n');
      const [company = '', project = '', dates = ''] = heading
        .split(PROJECT_METADATA_SEPARATOR)
        .map(value => value.trim());
      if (!project || !company || !dates) return [];
      return tableRows(lines)
        .filter(([contribution]) => contribution)
        .map(([contribution, description = '']) => ({
          project,
          company,
          dates,
          contribution,
          description,
        }));
    });

export const parseSkillsNote = (markdown: string): SkillsNote => {
  const skillRows = tableRows(sectionLines(markdown, SECTION_HEADING.SKILLS));
  const roleRows = tableRows(sectionLines(markdown, SECTION_HEADING.ROLES));
  const experience = tableRows(
    sectionLines(markdown, SECTION_HEADING.JOB_EXPERIENCE),
  )
    .filter(cells => cells[FIRST_CELL_INDEX])
    .map(([company, role = '', dates = '', context = '']) => ({
      company,
      role,
      dates,
      context,
    }));
  const languageRows = tableRows(
    sectionLines(markdown, SECTION_HEADING.LANGUAGES),
  );
  return {
    contributions: projectContributions(markdown),
    experience,
    languages: languageRows
      .map(cells => cells.filter(Boolean).join(LANGUAGE_PROFICIENCY_SEPARATOR))
      .filter(Boolean),
    skills: skillRows.map(cells => cells[FIRST_CELL_INDEX]).filter(Boolean),
    skillUsage: skillRows
      .filter(cells => cells[FIRST_CELL_INDEX])
      .map(([skill, usedIn = '']) => ({
        skill,
        companies: usedIn
          .split(USED_IN_SEPARATOR)
          .map(company => company.trim())
          .filter(Boolean),
      })),
    titles: roleRows.map(cells => cells[FIRST_CELL_INDEX]).filter(Boolean),
  };
};
