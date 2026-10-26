const LINKEDIN_DESCRIPTION_START = 'About the job';
const LINKEDIN_COMPANY_START = 'About the company';
// The description ends at whichever panel follows it first: the Premium upsell
// banner or, when that is missing, the hiring-insights chart and "Reactivate
// Premium" ad, and at the latest the company block, extracted separately.
const LINKEDIN_DESCRIPTION_END_MARKERS = [
  'Job search faster with Premium',
  'Unlock hiring insights',
  'Reactivate Premium',
  LINKEDIN_COMPANY_START,
];
// The company blurb ends at its expander, which reads "… more" or "Show more"
// collapsed and "Show less" once the bookmarklet has expanded it. When the
// expander is missing, the "Interested in working with us" prompt and the
// "Trending employee content" feed of employees' posts follow it, and
// "Navigating to" is the page's trailing accessibility announcement.
const LINKEDIN_COMPANY_END_MARKERS = [
  '\n… more',
  '\nShow more',
  '\nShow less',
  '\nInterested in working with us',
  '\nTrending employee content',
  '\nNavigating to',
];
const TRAILING_MORE_LABEL = /\s*…\s*more\s*$/;
const COMPANY_SECTION_LIMIT = 3000;
const LINKEDIN_TITLE_SUFFIX = /\s*\|\s*LinkedIn\s*$/;
const BLANK_LINES = /\n{3,}/g;

const firstIndexOf = (text: string, markers: string[], from = 0) =>
  Math.min(
    ...markers.map(marker => {
      const index = text.indexOf(marker, from);
      return index === -1 ? text.length : index;
    }),
  );

// LinkedIn's page text wraps the posting in the results list, navigation and
// Premium upsells. Anchoring on its section headings is sturdier than class
// names, which change often. Pages without those headings pass through as-is.
// The company block follows the description. The page title ("Role | Company | LinkedIn") is kept as a first line because
// the description does not always name the company.
export const extractJobPosting = (title: string, pageText: string): string => {
  const start = pageText.indexOf(LINKEDIN_DESCRIPTION_START);
  if (start === -1) return pageText;

  const afterStart = start + LINKEDIN_DESCRIPTION_START.length;
  const description = pageText
    .slice(
      afterStart,
      firstIndexOf(pageText, LINKEDIN_DESCRIPTION_END_MARKERS, afterStart),
    )
    .replace(TRAILING_MORE_LABEL, '')
    .trim();

  const companyStart = pageText.indexOf(LINKEDIN_COMPANY_START, afterStart);
  const companyText =
    companyStart === -1
      ? ''
      : pageText.slice(companyStart, companyStart + COMPANY_SECTION_LIMIT);
  const company = companyText
    .slice(0, firstIndexOf(companyText, LINKEDIN_COMPANY_END_MARKERS))
    .replace(TRAILING_MORE_LABEL, '')
    .trim();

  return [title.replace(LINKEDIN_TITLE_SUFFIX, '').trim(), description, company]
    .filter(Boolean)
    .join('\n\n')
    .replace(BLANK_LINES, '\n\n');
};

const SAVED_POSTING_URL_LINE = /^Posting URL:[^\n]*\n*/;
const TITLE_SEPARATOR = /\s+\|\s+/;
const MAX_TITLE_LENGTH = 200;

export type JobDescription = {
  role: string;
  company: string;
  description: string;
  companyBlurb: string;
};

// Splits a saved posting (see `extractJobPosting`) into its parts: the page
// title line ("Role | Company"), the description and the "About the company"
// block. Anything that does not fit stays in `description`.
export const parseJobDescription = (posting: string): JobDescription => {
  const text = posting.replace(SAVED_POSTING_URL_LINE, '').trim();
  const [firstBlock, ...rest] = text.split('\n\n');
  const hasTitle =
    rest.length > 0 &&
    !firstBlock.includes('\n') &&
    firstBlock.length <= MAX_TITLE_LENGTH &&
    !firstBlock.startsWith(LINKEDIN_COMPANY_START);
  const [role = '', company = ''] = hasTitle
    ? firstBlock.split(TITLE_SEPARATOR)
    : [];
  const body = hasTitle ? rest.join('\n\n') : text;

  const blurbStart = body.indexOf(LINKEDIN_COMPANY_START);
  const hasBlurb = blurbStart !== -1;
  return {
    role: role.trim(),
    company: company.trim(),
    description: (hasBlurb ? body.slice(0, blurbStart) : body).trim(),
    companyBlurb: hasBlurb
      ? body.slice(blurbStart + LINKEDIN_COMPANY_START.length).trim()
      : '',
  };
};
