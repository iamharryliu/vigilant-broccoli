export interface TodoRow {
  id: string;
  priority: string;
  description: string;
  recommendedFix: string;
}

export interface TodoSection {
  heading: string;
  rows: TodoRow[];
}

const SECTION_HEADING_REGEX = /^##\s+(.+)$/;
const HEADER_ID_CELL_REGEX = /^\|\s*ID\s*\|/i;
const SEPARATOR_ROW_REGEX = /^\|[\s:-]+\|/;
const UNESCAPED_PIPE_REGEX = /(?<!\\)\|/g;
const TABLE_ROW_PREFIX = '|';
const COLUMN_HEADERS = ['ID', 'Priority', 'Description', 'Recommended Fix'];
const MIN_COLUMN_WIDTH = 3;

const splitRowCells = (line: string): string[] => {
  const inner = line.trim().slice(1, -1);
  return inner.split(UNESCAPED_PIPE_REGEX).map(cell => cell.trim());
};

const escapeCell = (value: string): string =>
  value.replace(/\r?\n/g, '<br>').replace(UNESCAPED_PIPE_REGEX, '\\|');

const padCell = (value: string, width: number): string =>
  value + ' '.repeat(Math.max(0, width - value.length));

const renderTableLines = (rows: TodoRow[]): string[] => {
  const cells = rows.map(row => [
    row.id,
    row.priority,
    escapeCell(row.description),
    escapeCell(row.recommendedFix),
  ]);
  const widths = COLUMN_HEADERS.map((header, colIdx) =>
    Math.max(
      MIN_COLUMN_WIDTH,
      header.length,
      ...cells.map(cell => cell[colIdx].length),
    ),
  );
  const buildLine = (values: string[]) =>
    `| ${values.map((value, idx) => padCell(value, widths[idx])).join(' | ')} |`;

  return [
    buildLine(COLUMN_HEADERS),
    buildLine(widths.map(width => '-'.repeat(width))),
    ...cells.map(buildLine),
  ];
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
      if (cells.length >= 4) {
        rows.push({
          id: cells[0],
          priority: cells[1],
          description: cells[2],
          recommendedFix: cells[3],
        });
      }
      cursor++;
    }

    sections.push({ heading, rows });
    i = cursor;
  }

  return sections;
};

export const serializeTodoMarkdown = (
  content: string,
  sections: TodoSection[],
): string => {
  const sectionByHeading = new Map(
    sections.map(section => [section.heading, section]),
  );
  const lines = content.split('\n');
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const headingMatch = lines[i].match(SECTION_HEADING_REGEX);
    if (!headingMatch) {
      output.push(lines[i]);
      i++;
      continue;
    }
    output.push(lines[i]);
    const heading = headingMatch[1].trim();
    i++;

    let headerIdx = -1;
    while (i < lines.length && !SECTION_HEADING_REGEX.test(lines[i])) {
      if (HEADER_ID_CELL_REGEX.test(lines[i])) {
        headerIdx = i;
        break;
      }
      output.push(lines[i]);
      i++;
    }
    if (headerIdx === -1) continue;

    let cursor = headerIdx + 1;
    if (!(cursor < lines.length && SEPARATOR_ROW_REGEX.test(lines[cursor]))) {
      output.push(lines[headerIdx]);
      i = headerIdx + 1;
      continue;
    }
    cursor++;
    while (
      cursor < lines.length &&
      lines[cursor].trim().startsWith(TABLE_ROW_PREFIX)
    ) {
      cursor++;
    }

    const section = sectionByHeading.get(heading);
    output.push(
      ...(section
        ? renderTableLines(section.rows)
        : lines.slice(headerIdx, cursor)),
    );
    i = cursor;
  }

  return output.join('\n');
};
