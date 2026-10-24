export interface TodoRow {
  id: string;
  type: string;
  priority: string;
  agent: string;
  effort: string;
  brief: string;
  description: string;
  recommendedFix: string;
}

// A row with the wrong cell count is reported instead of skipped, so a
// malformed TODO.md row surfaces on the page rather than silently vanishing.
export class TodoParseError extends Error {}

const HEADER_ID_CELL_REGEX = /^\|\s*ID\s*\|/i;
const SEPARATOR_ROW_REGEX = /^\|[\s:-]+\|/;
const UNESCAPED_PIPE_REGEX = /(?<!\\)\|/g;
const TABLE_ROW_PREFIX = '|';
const COLUMN_HEADERS = [
  'ID',
  'Type',
  'Priority',
  'Agent',
  'Effort',
  'Brief',
  'Description',
  'Recommended Fix',
];

const malformedRowError = (
  lineNumber: number,
  cellCount: number,
  line: string,
): string =>
  `TODO.md line ${lineNumber} has ${cellCount} cells, expected ${COLUMN_HEADERS.length}. ` +
  `Keep the row on one line and escape any literal pipe as \\|: ${line.trim()}`;

const splitRowCells = (line: string): string[] => {
  const inner = line.trim().slice(1, -1);
  return inner.split(UNESCAPED_PIPE_REGEX).map(cell => cell.trim());
};

export const parseTodoMarkdown = (content: string): TodoRow[] => {
  const lines = content.split('\n');
  const headerIdx = lines.findIndex(line => HEADER_ID_CELL_REGEX.test(line));
  if (
    headerIdx === -1 ||
    !SEPARATOR_ROW_REGEX.test(lines[headerIdx + 1] ?? '')
  ) {
    return [];
  }

  const rows: TodoRow[] = [];
  for (
    let cursor = headerIdx + 2;
    cursor < lines.length && lines[cursor].trim().startsWith(TABLE_ROW_PREFIX);
    cursor++
  ) {
    const cells = splitRowCells(lines[cursor]);
    if (cells.length !== COLUMN_HEADERS.length) {
      throw new TodoParseError(
        malformedRowError(cursor + 1, cells.length, lines[cursor]),
      );
    }
    const [id, type, priority, agent, effort, brief, description, fix] = cells;
    rows.push({
      id,
      type,
      priority,
      agent,
      effort,
      brief,
      description,
      recommendedFix: fix,
    });
  }
  return rows;
};
