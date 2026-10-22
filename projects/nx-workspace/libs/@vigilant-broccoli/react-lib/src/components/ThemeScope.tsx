'use client';

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from 'react';
import { cn } from '../utils/cn';
import semanticTokens from '../theme-tokens.json';
import type { ThemeAppearance } from '../hooks/useThemePreference';

const LIGHT = 'light';
const DARK = 'dark';
const LIGHT_TOKENS = {
  '--gray-3': '#f0f0f3',
  '--gray-4': '#e8e8ec',
  '--gray-5': '#e0e1e6',
  '--gray-6': '#d9d9e0',
  '--gray-9': '#8b8d98',
  '--gray-10': '#80838d',
  '--gray-11': '#60646c',
  '--gray-12': '#1c2024',
  '--gray-a2': '#00005506',
  '--gray-a3': '#0000330f',
  '--gray-a4': '#00002d17',
  '--gray-a5': '#0009321f',
  '--gray-a8': '#00083046',
  '--gray-a9': '#00051d74',
  '--gray-a11': '#0007149f',
};

const DARK_TOKENS = {
  '--gray-3': '#212225',
  '--gray-4': '#272a2d',
  '--gray-5': '#2e3135',
  '--gray-6': '#363a3f',
  '--gray-9': '#696e77',
  '--gray-10': '#777b84',
  '--gray-11': '#b0b4ba',
  '--gray-12': '#edeef0',
  '--gray-a2': '#d8f4f609',
  '--gray-a3': '#ddeaf814',
  '--gray-a4': '#d3edf81d',
  '--gray-a5': '#d9edfe25',
  '--gray-a8': '#d9edff5d',
  '--gray-a9': '#dfebfd6d',
  '--gray-a11': '#f1f7feb5',
};

type AccentColor = 'blue' | 'sky';
type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

const getThemeStyle = (
  appearance: ThemeAppearance,
  accentColor: AccentColor,
): ThemeStyle => {
  const dark = appearance === DARK;
  const background = dark ? '#020617' : '#ffffff';
  const accent = accentColor === 'sky' ? '#00a2c7' : '#0090ff';

  return {
    ...semanticTokens[appearance],
    ...(dark ? DARK_TOKENS : LIGHT_TOKENS),
    '--color-background': 'hsl(var(--background))',
    '--color-panel-solid': 'hsl(var(--card))',
    '--accent-2': `color-mix(in srgb, ${accent} 5%, ${background})`,
    '--accent-3': `color-mix(in srgb, ${accent} 10%, ${background})`,
    '--accent-9': accent,
    '--accent-a4': `color-mix(in srgb, ${accent} 15%, transparent)`,
    '--blue-9': '#3b82f6',
    '--green-9': '#22c55e',
    '--radius-2': '0.375rem',
    '--shadow-2': '0 2px 8px rgb(0 0 0 / 0.15)',
    colorScheme: appearance,
    fontFamily: 'system-ui, sans-serif',
    color: 'hsl(var(--foreground))',
  };
};

const toInlineScriptJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c');

/**
 * Inline script for the first child of a server-rendered `ThemeScope`: it
 * applies a saved or system dark appearance to the parent before first paint,
 * leaving `style` overrides intact. Mirrors `useThemePreference`, which then
 * re-renders the scope to the same props after hydration.
 */
export const getThemeRestoreScript = (
  storageKey: string,
  style: CSSProperties = {},
) => {
  const darkVariables = Object.fromEntries(
    Object.entries(getThemeStyle(DARK, 'blue')).filter(
      ([key]) => key.startsWith('--') && !(key in style),
    ),
  );
  const setColorScheme = 'colorScheme' in style ? '' : `s.colorScheme=d;`;

  return `(function(){var e=document.currentScript.parentElement,d;try{d=localStorage.getItem(${toInlineScriptJson(storageKey)})}catch(x){}if(d!=='${LIGHT}'&&d!=='${DARK}')d=window.matchMedia&&matchMedia('${PREFERS_DARK_QUERY}').matches?'${DARK}':'${LIGHT}';if(d!=='${DARK}')return;var s=e.style,v=${toInlineScriptJson(darkVariables)};e.classList.replace('${LIGHT}',d);for(var k in v)s.setProperty(k,v[k]);${setColorScheme}})();`;
};

export const ThemeScope = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    appearance?: ThemeAppearance;
    hasBackground?: boolean;
    accentColor?: AccentColor;
  }
>(
  (
    {
      appearance = LIGHT,
      hasBackground = true,
      accentColor = 'blue',
      className,
      style,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(appearance, hasBackground && 'min-h-dvh', className)}
      style={{
        ...getThemeStyle(appearance, accentColor),
        backgroundColor: hasBackground ? 'var(--color-background)' : undefined,
        ...style,
      }}
      {...props}
    />
  ),
);
ThemeScope.displayName = 'ThemeScope';
