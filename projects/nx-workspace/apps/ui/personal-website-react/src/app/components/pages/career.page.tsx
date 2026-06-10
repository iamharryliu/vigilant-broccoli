import { GeneralLayout } from '../layouts/general-layout';
import { MarkdownPage } from '../global/markdown-page';

export function CareerPage() {
  return (
    <GeneralLayout>
      <div className="w-11/12 mx-auto">
        <MarkdownPage filepath="/assets/site-content/career.md" />
      </div>
    </GeneralLayout>
  );
}
