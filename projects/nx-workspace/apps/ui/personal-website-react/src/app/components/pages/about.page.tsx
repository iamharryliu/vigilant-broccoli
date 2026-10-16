import { GeneralLayout } from '../layouts/general-layout';
import { MarkdownPage } from '../global/markdown-page';
import aboutContent from '../../content/about.md?raw';

export function AboutPage() {
  return (
    <GeneralLayout>
      <div className="w-11/12 mx-auto mt-6">
        <MarkdownPage content={aboutContent} />
      </div>
    </GeneralLayout>
  );
}
