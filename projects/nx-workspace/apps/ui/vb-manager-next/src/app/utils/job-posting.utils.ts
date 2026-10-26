const LINKEDIN_DESCRIPTION_START = 'About the job';
const LINKEDIN_DESCRIPTION_END = 'Job search faster with Premium';
const LINKEDIN_COMPANY_START = 'About the company';
// The company blurb ends at its expander, which reads "Show more" collapsed and
// "Show less" once the bookmarklet has expanded it; "Navigating to" is the
// page's trailing accessibility announcement.
const LINKEDIN_COMPANY_END_MARKERS = [
  '\nShow more',
  '\nShow less',
  '\nNavigating to',
];
const TRAILING_MORE_LABEL = /\s*…\s*more\s*$/;
const COMPANY_SECTION_LIMIT = 3000;
const LINKEDIN_TITLE_SUFFIX = /\s*\|\s*LinkedIn\s*$/;
const BLANK_LINES = /\n{3,}/g;

// LinkedIn's page text wraps the posting in the results list, navigation and
// Premium upsells. Anchoring on its section headings is sturdier than class
// names, which change often. Pages without those headings pass through as-is.
// The company block follows the description. The page title ("Role | Company | LinkedIn") is kept as a first line because
// the description does not always name the company.
export const extractJobPosting = (title: string, pageText: string): string => {
  const start = pageText.indexOf(LINKEDIN_DESCRIPTION_START);
  if (start === -1) return pageText;

  const afterStart = start + LINKEDIN_DESCRIPTION_START.length;
  const end = pageText.indexOf(LINKEDIN_DESCRIPTION_END, afterStart);
  const description = pageText
    .slice(afterStart, end === -1 ? undefined : end)
    .trim();

  const companyStart = pageText.indexOf(LINKEDIN_COMPANY_START, afterStart);
  const companyText =
    companyStart === -1
      ? ''
      : pageText.slice(companyStart, companyStart + COMPANY_SECTION_LIMIT);
  const companyEnd = Math.min(
    ...LINKEDIN_COMPANY_END_MARKERS.map(marker => {
      const index = companyText.indexOf(marker);
      return index === -1 ? companyText.length : index;
    }),
  );
  const company = companyText
    .slice(0, companyEnd)
    .replace(TRAILING_MORE_LABEL, '')
    .trim();

  return [title.replace(LINKEDIN_TITLE_SUFFIX, '').trim(), description, company]
    .filter(Boolean)
    .join('\n\n')
    .replace(BLANK_LINES, '\n\n');
};
