export const RESUME_PDF_MAX_PAGES = 1;

/**
 * Soft fill target as a share of the printable page height (Letter minus the
 * 0.2in margins). Content below the band is "underfilled"; content above it
 * still fits and is never shortened, so the unused tail is a deliberate
 * gutter of about 3% (roughly two lines) rather than text on the page edge.
 */
export const RESUME_PDF_FILL_TARGET = {
  MIN_RATIO: 0.9,
  MAX_RATIO: 0.97,
} as const;

const PERCENT = 100;

export interface ResumePdfSectionLayout {
  name: string;
  heightPx: number;
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
  const fonts = layout.fontsLoaded
    ? ''
    : ' Roboto could not be loaded in time, so a fallback font was measured.';
  return `Rendered resume PDF ${verdict}. Printable height ${layout.pageContentHeightPx}px, content height ${layout.contentHeightPx}px (${sections}).${fill}${fonts}`;
};

export const isResumePdfFilled = (layout: ResumePdfLayout): boolean =>
  layout.fits && !layout.underfilled;

/** Smaller is nearer the fill target; 0 means inside or above the band. */
export const resumePdfFillShortfallPx = (layout: ResumePdfLayout): number =>
  Math.max(0, layout.targetMinContentPx - layout.contentHeightPx);
