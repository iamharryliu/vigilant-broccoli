export interface TodoRow {
  id: string;
  priority: string;
  agent: string;
  effort: string;
  brief: string;
  description: string;
  recommendedFix: string;
}

export interface TodoSection {
  heading: string;
  description: string;
  rows: TodoRow[];
}

// A row with the wrong cell count is reported instead of skipped, so a
// malformed TODO.md row surfaces on the page rather than silently vanishing.
export class TodoParseError extends Error {}

const SECTION_HEADING_REGEX = /^##\s+(.+)$/;
const HEADER_ID_CELL_REGEX = /^\|\s*ID\s*\|/i;
const SEPARATOR_ROW_REGEX = /^\|[\s:-]+\|/;
const UNESCAPED_PIPE_REGEX = /(?<!\\)\|/g;
const TABLE_ROW_PREFIX = '|';
const COLUMN_HEADERS = [
  'ID',
  'Priority',
  'Agent',
  'Effort',
  'Brief',
  'Description',
  'Recommended Fix',
];

const malformedRowError = (
  heading: string,
  lineNumber: number,
  cellCount: number,
  line: string,
): string =>
  `TODO.md line ${lineNumber} (section "${heading}") has ${cellCount} cells, expected ${COLUMN_HEADERS.length}. ` +
  `Keep the row on one line and escape any literal pipe as \\|: ${line.trim()}`;

const splitRowCells = (line: string): string[] => {
  const inner = line.trim().slice(1, -1);
  return inner.split(UNESCAPED_PIPE_REGEX).map(cell => cell.trim());
};

export const parseTodoMarkdown = (content: string): TodoSection[] => {
  const lines = content.split('\n');
  const sections: TodoSection[] = [];
  let i = 0;

  while (i < lines.length) {
    const headingMatch = lines[i].match(SECTION_HEADING_REGEX);
    if (!headingMatch) {
      i++;
      continue;
    }
    const heading = headingMatch[1].trim();
    i++;
    const descriptionStart = i;

    let headerIdx = -1;
    while (i < lines.length && !SECTION_HEADING_REGEX.test(lines[i])) {
      if (HEADER_ID_CELL_REGEX.test(lines[i])) {
        headerIdx = i;
        break;
      }
      i++;
    }
    if (headerIdx === -1) continue;

    let cursor = headerIdx + 1;
    if (!(cursor < lines.length && SEPARATOR_ROW_REGEX.test(lines[cursor]))) {
      i = cursor;
      continue;
    }
    cursor++;

    const rows: TodoRow[] = [];
    while (
      cursor < lines.length &&
      lines[cursor].trim().startsWith(TABLE_ROW_PREFIX)
    ) {
      const cells = splitRowCells(lines[cursor]);
      if (cells.length !== COLUMN_HEADERS.length) {
        throw new TodoParseError(
          malformedRowError(heading, cursor + 1, cells.length, lines[cursor]),
        );
      }
      rows.push({
        id: cells[0],
        priority: cells[1],
        agent: cells[2],
        effort: cells[3],
        brief: cells[4],
        description: cells[5],
        recommendedFix: cells[6],
      });
      cursor++;
    }

    sections.push({
      heading,
      description: lines.slice(descriptionStart, headerIdx).join('\n').trim(),
      rows,
    });
    i = cursor;
  }

  return sections;
};
