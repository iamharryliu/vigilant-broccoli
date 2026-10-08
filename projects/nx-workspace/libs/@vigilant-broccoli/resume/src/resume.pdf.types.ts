export const RESUME_PDF_MAX_PAGES = 1;

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
  const fonts = layout.fontsLoaded
    ? ''
    : ' Roboto could not be loaded in time, so a fallback font was measured.';
  return `Rendered resume PDF ${verdict}. Printable height ${layout.pageContentHeightPx}px, content height ${layout.contentHeightPx}px (${sections}).${fonts}`;
};
