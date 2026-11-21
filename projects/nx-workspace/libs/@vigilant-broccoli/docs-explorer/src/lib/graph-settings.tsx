import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  IconButton,
  Popover,
  Select,
  Switch,
  useMediaQuery,
} from '@vigilant-broccoli/react-lib';
import { DESKTOP_MEDIA_QUERY } from './DocsExplorer';
import { DEFAULT_FORCES, FORCE_LIMITS, type GraphForces } from './graph-view';
import {
  DEFAULT_GRAPH_COLOR_SCHEME_ID,
  findGraphColorScheme,
  GRAPH_COLOR_SCHEMES,
  type GraphColorScheme,
} from './graph-color-schemes';

const NODE_GLOW_OFF = 'off';
const FORCE_SAVE_DELAY_MS = 300;

const FORCE_ORDER: (keyof GraphForces)[] = [
  'center',
  'repel',
  'link',
  'linkDistance',
];
const FORCE_LABEL: Record<keyof GraphForces, string> = {
  center: 'Center force',
  repel: 'Repel force',
  link: 'Link force',
  linkDistance: 'Link distance',
};

const COPY = {
  FORCES: 'Forces',
  RESET: 'Reset forces',
  SETTINGS: 'Graph settings',
  COLOR_SCHEME: 'Color scheme',
  NODE_GLOW: 'Node glow',
} as const;

// `docs-md` keeps the keys the notes graph has always used, so saved
// preferences survive; other graphs pass their own prefix to stay independent.
const storageKeys = (prefix: string) => ({
  colorScheme: `${prefix}:graph-color-scheme`,
  nodeGlow: `${prefix}:graph-node-glow`,
  force: (key: keyof GraphForces) => `${prefix}:graph-force-${key}`,
});

export interface GraphSettings {
  // What the sliders show; changes on every input event.
  forces: GraphForces;
  // What to pass to GraphView: follows `forces` at most once per frame, so a
  // slider drag does not re-heat the simulation on every event.
  appliedForces: GraphForces;
  colorScheme: GraphColorScheme;
  showNodeGlow: boolean;
  updateForce: (key: keyof GraphForces, value: number) => void;
  resetForces: () => void;
  updateColorScheme: (scheme: GraphColorScheme) => void;
  updateNodeGlow: (next: boolean) => void;
}

/** Color scheme, node glow and forces for a `GraphView`, persisted per prefix. */
export function useGraphSettings(
  storagePrefix: string,
  defaultColorSchemeId: string = DEFAULT_GRAPH_COLOR_SCHEME_ID,
): GraphSettings {
  const keys = storageKeys(storagePrefix);
  const [forces, setForces] = useState<GraphForces>(DEFAULT_FORCES);
  const [colorSchemeId, setColorSchemeId] = useState(defaultColorSchemeId);
  const [showNodeGlow, setShowNodeGlow] = useState(true);

  useEffect(() => {
    const storedScheme = findGraphColorScheme(
      window.localStorage.getItem(keys.colorScheme),
    );
    if (storedScheme) setColorSchemeId(storedScheme.id);
    setShowNodeGlow(
      window.localStorage.getItem(keys.nodeGlow) !== NODE_GLOW_OFF,
    );
    setForces(prev => {
      const next = { ...prev };
      for (const key of FORCE_ORDER) {
        const raw = window.localStorage.getItem(keys.force(key));
        if (raw === null) continue;
        const value = Number(raw);
        const lim = FORCE_LIMITS[key];
        if (Number.isFinite(value) && value >= lim.min && value <= lim.max) {
          next[key] = value;
        }
      }
      return next;
    });
    // keys derive from storagePrefix alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storagePrefix]);

  const [appliedForces, setAppliedForces] = useState<GraphForces>(forces);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAppliedForces(forces));
    return () => cancelAnimationFrame(frame);
  }, [forces]);

  // Saved once the slider rests rather than on every input event.
  const saveTimers = useRef<
    Partial<Record<keyof GraphForces, ReturnType<typeof setTimeout>>>
  >({});
  useEffect(() => {
    const timers = saveTimers.current;
    return () => {
      for (const timer of Object.values(timers)) clearTimeout(timer);
    };
  }, []);

  return {
    forces,
    appliedForces,
    colorScheme: findGraphColorScheme(colorSchemeId) ?? GRAPH_COLOR_SCHEMES[0],
    showNodeGlow,
    updateForce: (key, value) => {
      setForces(prev => ({ ...prev, [key]: value }));
      clearTimeout(saveTimers.current[key]);
      saveTimers.current[key] = setTimeout(
        () => window.localStorage.setItem(keys.force(key), String(value)),
        FORCE_SAVE_DELAY_MS,
      );
    },
    resetForces: () => {
      for (const timer of Object.values(saveTimers.current))
        clearTimeout(timer);
      saveTimers.current = {};
      setForces(DEFAULT_FORCES);
      for (const key of FORCE_ORDER)
        window.localStorage.removeItem(keys.force(key));
    },
    updateColorScheme: scheme => {
      setColorSchemeId(scheme.id);
      window.localStorage.setItem(keys.colorScheme, scheme.id);
    },
    updateNodeGlow: next => {
      setShowNodeGlow(next);
      if (next) window.localStorage.removeItem(keys.nodeGlow);
      else window.localStorage.setItem(keys.nodeGlow, NODE_GLOW_OFF);
    },
  };
}

const colorSchemeLabel = (scheme: GraphColorScheme) => (
  <span className="flex items-center gap-2">
    {scheme.colors && (
      <span className="flex" aria-hidden>
        {scheme.colors.map(color => (
          <span
            key={color}
            className="h-3 w-3 first:rounded-l-sm last:rounded-r-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
    )}
    {scheme.name}
  </span>
);

/** Color scheme select, node glow switch and force sliders for `settings`. */
export function GraphSettingsFields({ settings }: { settings: GraphSettings }) {
  const {
    forces,
    colorScheme,
    showNodeGlow,
    updateForce,
    resetForces,
    updateColorScheme,
    updateNodeGlow,
  } = settings;
  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{COPY.COLOR_SCHEME}</span>
        <Select
          aria-label={COPY.COLOR_SCHEME}
          className="h-7 text-xs"
          value={colorScheme}
          onValueChange={updateColorScheme}
          options={[...GRAPH_COLOR_SCHEMES]}
          renderItem={colorSchemeLabel}
        />
        <label className="flex items-center justify-between text-xs">
          <span>{COPY.NODE_GLOW}</span>
          <Switch checked={showNodeGlow} onCheckedChange={updateNodeGlow} />
        </label>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">{COPY.FORCES}</span>
        {FORCE_ORDER.map(key => {
          const lim = FORCE_LIMITS[key];
          return (
            <label key={key} className="flex flex-col gap-1">
              <span className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{FORCE_LABEL[key]}</span>
                <span className="tabular-nums">{forces[key]}</span>
              </span>
              <input
                type="range"
                className="h-1.5 w-full cursor-pointer accent-blue-500"
                min={lim.min}
                max={lim.max}
                step={lim.step}
                value={forces[key]}
                onChange={e => updateForce(key, e.target.valueAsNumber)}
              />
            </label>
          );
        })}
        <Button
          size="sm"
          variant="ghost"
          className="self-end"
          onClick={resetForces}
        >
          {COPY.RESET}
        </Button>
      </div>
    </>
  );
}

/**
 * Settings gear that opens `children` in a popover on desktop and a dialog
 * on mobile. The caller positions it.
 */
export function GraphSettingsMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const trigger = (
    <IconButton
      variant="ghost"
      icon="settings"
      aria-label={COPY.SETTINGS}
      onClick={isDesktop ? undefined : () => setOpen(true)}
    />
  );

  if (isDesktop) {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>{trigger}</Popover.Trigger>
        <Popover.Content align="end" className="flex w-72 flex-col gap-4">
          {children}
        </Popover.Content>
      </Popover.Root>
    );
  }

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{COPY.SETTINGS}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
