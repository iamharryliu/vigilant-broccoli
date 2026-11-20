'use client';

import { RefObject, useEffect, useRef } from 'react';

export const SPEECH_LANGUAGE_ATTRIBUTE = 'data-speech-language';

const MAX_SELECTION_LENGTH = 500;
const SELECTION_SETTLE_MS = 0;
const IGNORED_SELECTOR =
  'input, textarea, button, [contenteditable=""], [contenteditable="true"]';
const SPEECH_LANGUAGE_SELECTOR = `[${SPEECH_LANGUAGE_ATTRIBUTE}]`;

function toElement(node: Node | null): Element | null {
  return node instanceof Element ? node : (node?.parentElement ?? null);
}

export function useSpeakOnSelect(
  rootRef: RefObject<HTMLElement | null>,
  onSpeak: (text: string, languageCode?: string) => void,
) {
  const onSpeakRef = useRef(onSpeak);
  onSpeakRef.current = onSpeak;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    function speakSelection() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0)
        return;

      const text = selection.toString().trim();
      if (!text || text.length > MAX_SELECTION_LENGTH) return;

      const anchor = toElement(selection.anchorNode);
      const focus = toElement(selection.focusNode);
      if (!anchor || !focus) return;
      if (anchor.closest(IGNORED_SELECTOR) || focus.closest(IGNORED_SELECTOR))
        return;

      const container = toElement(
        selection.getRangeAt(0).commonAncestorContainer,
      )?.closest(SPEECH_LANGUAGE_SELECTOR);
      if (!container || !root?.contains(container)) return;

      onSpeakRef.current(
        text,
        container.getAttribute(SPEECH_LANGUAGE_ATTRIBUTE) || undefined,
      );
    }

    function handleSelectionEnd() {
      clearTimeout(timeout);
      timeout = setTimeout(speakSelection, SELECTION_SETTLE_MS);
    }

    root.addEventListener('mouseup', handleSelectionEnd);
    root.addEventListener('touchend', handleSelectionEnd);
    return () => {
      clearTimeout(timeout);
      root.removeEventListener('mouseup', handleSelectionEnd);
      root.removeEventListener('touchend', handleSelectionEnd);
    };
  }, [rootRef]);
}
