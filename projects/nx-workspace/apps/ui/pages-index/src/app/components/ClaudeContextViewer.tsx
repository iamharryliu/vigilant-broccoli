import '@radix-ui/themes/styles.css';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import type { DocsExplorerUrlSync } from '@vigilant-broccoli/react-lib';
import {
  createDocsSnapshotSource,
  DocsViewer,
  FILE_PARAM,
} from '@vigilant-broccoli/react-utility';
import { CLAUDE_CONTEXT_SNAPSHOT_URL } from '../consts/claudeContext';
import { useRadixAppearance } from '../use-prefers-dark';

const HASH_PREFIX = '#';
const DUMMY_ORIGIN = 'http://localhost';

const { fetchStructure, fetchContent, fetchGraph, searchDocs } =
  createDocsSnapshotSource(CLAUDE_CONTEXT_SNAPSHOT_URL);

// Under HashRouter the route lives in window.location.hash
// (`#/claude-context?file=docs/CI.md#heading`), so the selected file and the
// heading anchor are read from and written into that route rather than the
// window's own search/fragment. Read from window.location (not useLocation) so
// consecutive writes within one event see each other's result.
const readRoute = () =>
  new URL(window.location.hash.slice(HASH_PREFIX.length), DUMMY_ORIGIN);

export default function ClaudeContextViewer() {
  const navigate = useNavigate();
  const appearance = useRadixAppearance();

  const urlSync = useMemo<DocsExplorerUrlSync>(
    () => ({
      get: () => readRoute().searchParams.get(FILE_PARAM),
      set: path => {
        const route = readRoute();
        route.searchParams.set(FILE_PARAM, path);
        navigate({ search: route.search, hash: route.hash });
      },
      getHash: () => readRoute().hash.slice(HASH_PREFIX.length),
      setHash: hash => {
        const route = readRoute();
        navigate(
          { search: route.search, hash: `${HASH_PREFIX}${hash}` },
          { replace: true },
        );
      },
    }),
    [navigate],
  );

  return (
    <Theme
      appearance={appearance}
      hasBackground={false}
      accentColor="sky"
      className="flex !min-h-0 flex-1 flex-col"
    >
      <DocsViewer
        getStructure={fetchStructure}
        getContent={fetchContent}
        search={searchDocs}
        getGraph={fetchGraph}
        urlSync={urlSync}
      />
    </Theme>
  );
}
