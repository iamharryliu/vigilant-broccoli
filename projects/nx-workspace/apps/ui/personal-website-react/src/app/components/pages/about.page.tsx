import { GeneralLayout } from '../layouts/general-layout';
import { MarkdownPage } from '../global/markdown-page';

export function AboutPage() {
  return (
    <GeneralLayout>
      <div className="w-11/12 mx-auto mt-6">
        <MarkdownPage filepath="/assets/site-content/about.md" />
      </div>
    </GeneralLayout>
  );
}
