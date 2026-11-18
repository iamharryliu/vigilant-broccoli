import { ExternalLink } from 'lucide-react';
import { buttonVariants } from '@vigilant-broccoli/react-lib';

const DOCS_URL = 'https://docs.vigilant-broccoli.app/';
const VISIT_LABEL = 'Open docs.vigilant-broccoli.app';

export const DocsExplorerDemo = () => (
  <a
    href={DOCS_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`${buttonVariants()} self-start`}
  >
    {VISIT_LABEL}
    <ExternalLink className="h-4 w-4" />
  </a>
);
