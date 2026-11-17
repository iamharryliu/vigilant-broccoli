export interface MarkdownSection {
  id: string;
  title: string;
  markdown: string;
}

export interface SplitMarkdown {
  intro: string;
  sections: MarkdownSection[];
}

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;

// Splits at ATX headings of exactly `level`, ignoring `#` lines inside fenced
// code so a shell comment in a code block never becomes a section.
export const splitMarkdownSections = (
  content: string,
  level: number,
): SplitMarkdown => {
  const headingRe = new RegExp(`^ {0,3}#{${level}}[ \\t]+(.+?)[ \\t#]*$`);
  const intro: string[] = [];
  const sections: { title: string; lines: string[] }[] = [];
  let fence: string | null = null;

  for (const line of content.split('\n')) {
    const fenceMark = FENCE_RE.exec(line)?.[1];
    if (fenceMark) {
      if (fence === null) fence = fenceMark[0];
      else if (fenceMark[0] === fence) fence = null;
    }
    const title = fence === null ? headingRe.exec(line)?.[1] : undefined;
    if (title !== undefined) {
      sections.push({ title, lines: [] });
    } else {
      (sections.length ? sections[sections.length - 1].lines : intro).push(
        line,
      );
    }
  }

  return {
    intro: intro.join('\n'),
    sections: sections.map(({ title, lines }, index) => ({
      id: `section-${index}`,
      title,
      markdown: lines.join('\n'),
    })),
  };
};
