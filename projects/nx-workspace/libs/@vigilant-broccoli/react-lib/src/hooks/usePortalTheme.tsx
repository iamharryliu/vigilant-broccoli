'use client';

import { useLayoutEffect, useState, type CSSProperties } from 'react';

const THEME_SELECTOR = '.dark, .light';
const DARK_CLASS = 'dark';
const CSS_VARIABLE_PREFIX = '--';
const ATTRIBUTE_OPTIONS = { attributes: true };

export function usePortalTheme() {
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  const [theme, setTheme] = useState<{
    className?: string;
    style?: CSSProperties;
  }>({});

  useLayoutEffect(() => {
    const scope = anchor?.parentElement;
    if (!scope) return;

    const updateTheme = () => {
      const computed = getComputedStyle(scope);
      const variables = Object.fromEntries(
        Array.from(computed)
          .filter(property => property.startsWith(CSS_VARIABLE_PREFIX))
          .map(property => [property, computed.getPropertyValue(property)]),
      );
      setTheme({
        className: scope.closest(THEME_SELECTOR)?.classList.contains(DARK_CLASS)
          ? DARK_CLASS
          : undefined,
        style: variables as CSSProperties,
      });
    };

    // Body portals leave both Tailwind theme classes and inherited Radix/custom variables behind.
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    for (
      let ancestor: Element | null = scope;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      observer.observe(ancestor, ATTRIBUTE_OPTIONS);
    }
    return () => observer.disconnect();
  }, [anchor]);

  return { anchorRef: setAnchor, ...theme };
}
