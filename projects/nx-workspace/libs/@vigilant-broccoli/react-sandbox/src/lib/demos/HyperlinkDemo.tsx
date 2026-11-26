import { Hyperlink } from '@vigilant-broccoli/react-lib';
import { BookOpen, Code2 } from 'lucide-react';
import { DemoSection } from './DemoSection';

export const HyperlinkDemo = () => (
  <div className="flex flex-col gap-6">
    <DemoSection title="External">
      <Hyperlink href="https://leetcode.com/problems/two-sum/">
        LeetCode
      </Hyperlink>
    </DemoSection>
    <DemoSection title="With leading icon">
      <Hyperlink href="https://leetcode.com/problems/two-sum/" icon={Code2}>
        Two Sum
      </Hyperlink>
    </DemoSection>
    <DemoSection title="Internal">
      <Hyperlink href="#" icon={BookOpen}>
        Read the notes
      </Hyperlink>
    </DemoSection>
  </div>
);
