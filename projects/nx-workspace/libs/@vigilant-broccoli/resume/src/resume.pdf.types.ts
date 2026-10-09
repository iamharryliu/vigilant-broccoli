export const RESUME_PDF_MAX_PAGES = 1;

/**
 * Soft fill target as a share of the printable page height (Letter minus the
 * 0.2in margins). Content below the band is "underfilled"; content above it
 * still fits and is never shortened, so the unused tail is a deliberate
 * gutter of about 2% (roughly one line) rather than text on the page edge.
 */
export const RESUME_PDF_FILL_TARGET = {
  MIN_RATIO: 0.95,
  MAX_RATIO: 0.98,
} as const;

/** A wrapped line that ends emptier than this reads as a stray few words. */
export const RESUME_PDF_MIN_LAST_LINE_RATIO = 0.7;

export const RESUME_PDF_SKILLS_TARGET_LINES = 1;

const PERCENT = 100;

export interface ResumePdfSectionLayout {
  name: string;
  heightPx: number;
}

export interface ResumePdfShortLine {
  text: string;
  fillRatio: number;
}

export interface ResumePdfLayout {
  pageCount: number;
  maxPages: number;
  fits: boolean;
  contentHeightPx: number;
  pageContentHeightPx: number;
  overflowPx: number;
  overflowLines: number;
  unusedPx: number;
  unusedLines: number;
  fillRatio: number;
  targetMinContentPx: number;
  targetMaxContentPx: number;
  underfilled: boolean;
  fontsLoaded: boolean;
  sections: ResumePdfSectionLayout[];
  shortLastLines: ResumePdfShortLine[];
  skillsLineCount: number;
}

export const describeResumePdfLayout = (layout: ResumePdfLayout): string => {
  const sections = layout.sections
    .map(({ name, heightPx }) => `${name}: ${heightPx}px`)
    .join(', ');
  const verdict = layout.fits
    ? `fits on ${layout.pageCount} page`
    : `spans ${layout.pageCount} pages; the limit is ${layout.maxPages}, about ${layout.overflowLines} lines (${layout.overflowPx}px) too long`;
  const fill = layout.fits
    ? ` ${Math.round(layout.fillRatio * PERCENT)}% of the printable height is used (target ${layout.targetMinContentPx}-${layout.targetMaxContentPx}px of content); ${
        layout.underfilled
          ? `underfilled by about ${layout.unusedLines} lines (${layout.unusedPx}px unused)`
          : 'within or above the target band'
      }.`
    : '';
  const shortLines = layout.shortLastLines.length
    ? ` Wrapped lines ending under ${Math.round(RESUME_PDF_MIN_LAST_LINE_RATIO * PERCENT)}% full (tighten each to one line, or extend it with supported detail): ${layout.shortLastLines
        .map(
          ({ text, fillRatio }) =>
            `"${text}" (${Math.round(fillRatio * PERCENT)}%)`,
        )
        .join('; ')}.`
    : '';
  const skills =
    layout.skillsLineCount > RESUME_PDF_SKILLS_TARGET_LINES
      ? ` The skills line wraps onto ${layout.skillsLineCount} lines; prefer ${RESUME_PDF_SKILLS_TARGET_LINES} by keeping only the most job-relevant skills.`
      : '';
  const fonts = layout.fontsLoaded
    ? ''
    : ' Roboto could not be loaded in time, so a fallback font was measured.';
  return `Rendered resume PDF ${verdict}. Printable height ${layout.pageContentHeightPx}px, content height ${layout.contentHeightPx}px (${sections}).${fill}${shortLines}${skills}${fonts}`;
};

export const isResumePdfFilled = (layout: ResumePdfLayout): boolean =>
  layout.fits && !layout.underfilled;

export const isResumePdfPolished = (layout: ResumePdfLayout): boolean =>
  isResumePdfFilled(layout) && layout.shortLastLines.length === 0;

/** Smaller is nearer the fill target; 0 means inside or above the band. */
export const resumePdfFillShortfallPx = (layout: ResumePdfLayout): number =>
  Math.max(0, layout.targetMinContentPx - layout.contentHeightPx);
