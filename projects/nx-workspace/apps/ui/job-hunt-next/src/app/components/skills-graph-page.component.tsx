'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  GraphSettingsFields,
  GraphSettingsMenu,
  GraphView,
  useGraphSettings,
  type GraphLinkStyle,
} from '@vigilant-broccoli/docs-explorer';
import { Switch } from '@vigilant-broccoli/react-lib';
import { useSkillMatches } from '../hooks/use-skill-matches';
import { useTranslation } from '../i18n';
import {
  DEFAULT_MIN_SHARED_POSTINGS,
  GROUP_NODE_PREFIX,
  MIN_SHARED_POSTINGS_RANGE,
  SKILL_LINK_KIND,
  buildSkillGraph,
} from '../utils/skill-graph.utils';
import {
  SkillPostingsDialog,
  type SkillPostings,
} from './skill-postings-dialog.component';

const SETTINGS_STORAGE_PREFIX = 'job-hunt-skills';
const PAIRINGS_STORAGE_KEY = `${SETTINGS_STORAGE_PREFIX}:graph-pairings`;
const MIN_SHARED_STORAGE_KEY = `${SETTINGS_STORAGE_PREFIX}:graph-min-shared`;
const STORED_ON = 'on';
const STORED_OFF = 'off';

// Muted and dashed so the group structure stays the dominant shape.
const LINK_STYLES: Record<string, GraphLinkStyle> = {
  [SKILL_LINK_KIND.CO_OCCURS]: { color: '#94a3b8', dash: [4, 4] },
};

const readStored = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Blocked storage: the choice lasts until reload.
  }
};

export const SkillsGraphPage = () => {
  const { t } = useTranslation();
  const settings = useGraphSettings(SETTINGS_STORAGE_PREFIX);
  // The dialog's percentage is the share of a posting's skills that the career
  // file lists, so the postings are scored against the owned skills.
  const { matches, loadFailed } = useSkillMatches();
  const [selection, setSelection] = useState<SkillPostings | null>(null);
  const [showPairings, setShowPairings] = useState(false);
  const [minSharedPostings, setMinSharedPostings] = useState(
    DEFAULT_MIN_SHARED_POSTINGS,
  );

  useEffect(() => {
    setShowPairings(readStored(PAIRINGS_STORAGE_KEY) === STORED_ON);
    const stored = Number(readStored(MIN_SHARED_STORAGE_KEY));
    if (
      Number.isInteger(stored) &&
      stored >= MIN_SHARED_POSTINGS_RANGE.min &&
      stored <= MIN_SHARED_POSTINGS_RANGE.max
    ) {
      setMinSharedPostings(stored);
    }
  }, []);

  const changeShowPairings = (next: boolean) => {
    setShowPairings(next);
    writeStored(PAIRINGS_STORAGE_KEY, next ? STORED_ON : STORED_OFF);
  };

  const changeMinSharedPostings = (next: number) => {
    setMinSharedPostings(next);
    writeStored(MIN_SHARED_STORAGE_KEY, String(next));
  };

  const graph = useMemo(
    () => buildSkillGraph(matches, { showPairings, minSharedPostings }),
    [matches, showPairings, minSharedPostings],
  );

  const showPostings = (id: string) => {
    if (id.startsWith(GROUP_NODE_PREFIX)) return;
    setSelection({
      skill: id,
      matches: matches.filter(
        match => match.matched.includes(id) || match.gaps.includes(id),
      ),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <p className="m-0 text-sm text-muted-foreground">
        {t('SKILLS_GRAPH.DESCRIPTION', {
          count: String(minSharedPostings),
        })}
      </p>
      {loadFailed && (
        <p className="text-sm text-destructive">{t('MATCHES.LOAD_FAILED')}</p>
      )}
      <div className="relative min-h-64 flex-1 overflow-hidden rounded-lg border border-border bg-card">
        <GraphView
          graph={graph}
          onSelect={showPostings}
          palette={settings.colorScheme.colors ?? undefined}
          forces={settings.appliedForces}
          showNodeGlow={settings.showNodeGlow}
          linkStyles={LINK_STYLES}
          keyboardLabel={t('SKILLS_GRAPH.GRAPH_LABEL')}
          zoomControls={{
            zoomIn: t('SKILLS_GRAPH.ZOOM_IN'),
            zoomOut: t('SKILLS_GRAPH.ZOOM_OUT'),
            reset: t('SKILLS_GRAPH.RESET_VIEW'),
          }}
        />
        <div className="absolute right-2 top-2 z-10">
          <GraphSettingsMenu>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {t('SKILLS_GRAPH.LINKS')}
              </span>
              <label className="flex items-center justify-between text-xs">
                <span>{t('SKILLS_GRAPH.SHOW_PAIRINGS')}</span>
                <Switch
                  checked={showPairings}
                  onCheckedChange={changeShowPairings}
                />
              </label>
              {showPairings && (
                <label className="flex flex-col gap-1">
                  <span className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('SKILLS_GRAPH.MIN_SHARED')}</span>
                    <span className="tabular-nums">{minSharedPostings}</span>
                  </span>
                  <input
                    type="range"
                    className="h-1.5 w-full cursor-pointer accent-blue-500"
                    min={MIN_SHARED_POSTINGS_RANGE.min}
                    max={MIN_SHARED_POSTINGS_RANGE.max}
                    step={1}
                    value={minSharedPostings}
                    onChange={event =>
                      changeMinSharedPostings(event.target.valueAsNumber)
                    }
                  />
                </label>
              )}
            </div>
            <GraphSettingsFields settings={settings} />
          </GraphSettingsMenu>
        </div>
      </div>
      <SkillPostingsDialog
        selection={selection}
        onClose={() => setSelection(null)}
      />
    </div>
  );
};
