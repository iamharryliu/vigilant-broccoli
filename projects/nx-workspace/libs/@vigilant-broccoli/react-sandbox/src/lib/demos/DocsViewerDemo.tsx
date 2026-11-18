import { useState } from 'react';
import {
  type DocsNode,
  DocsViewer,
  GraphView,
  type NoteGraph,
} from '@vigilant-broccoli/docs-explorer';

const CONTENT: Record<string, string> = {
  'README.md': '# Welcome\n\nSee [Guide](guide.md).',
  'guide.md':
    '# Guide\n\nA short guide with a [link back](README.md).\n\n- [ ] Read the guide\n- [ ] Try the Checklist view',
};

const STRUCTURE: DocsNode[] = Object.keys(CONTENT).map(path => ({
  name: path,
  path,
  type: 'file',
}));

export const DocsViewerDemo = () => (
  <div className="h-96">
    <DocsViewer
      siteName="Sample docs"
      getStructure={async () => STRUCTURE}
      getContent={async path => CONTENT[path] ?? ''}
    />
  </div>
);

const GRAPH: NoteGraph = {
  nodes: [
    { id: 'README.md', name: 'README', group: 'root' },
    { id: 'guide.md', name: 'Guide', group: 'docs' },
    { id: 'faq.md', name: 'FAQ', group: 'docs' },
  ],
  links: [
    { source: 'README.md', target: 'guide.md' },
    { source: 'guide.md', target: 'faq.md' },
  ],
};

export const GraphViewDemo = () => {
  const [activePath, setActivePath] = useState('README.md');
  return (
    <div className="h-80">
      <GraphView
        graph={GRAPH}
        activePath={activePath}
        onSelect={setActivePath}
      />
    </div>
  );
};
