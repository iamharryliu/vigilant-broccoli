'use client';

import { RefObject, useEffect, useRef } from 'react';

export const SPEECH_LANGUAGE_ATTRIBUTE = 'data-speech-language';

const MAX_SELECTION_LENGTH = 500;
// Phones adjust a selection by dragging its handles, which fires no
// mouseup/touchend, so speech waits for `selectionchange` to go quiet instead.
const SELECTION_SETTLE_MS = 600;
const IGNORED_SELECTOR =
  'input, textarea, button, [contenteditable=""], [contenteditable="true"]';
const SPEECH_LANGUAGE_SELECTOR = `[${SPEECH_LANGUAGE_ATTRIBUTE}]`;

const toElement = (node: Node | null): Element | null =>
  node instanceof Element ? node : (node?.parentElement ?? null);

export const useSpeakOnSelect = (
  rootRef: RefObject<HTMLElement | null>,
  onSpeak: (text: string, language: string) => void,
) => {
  const onSpeakRef = useRef(onSpeak);
  onSpeakRef.current = onSpeak;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    // `selectionchange` also fires when nothing visible changed, so the same
    // selection is spoken once until it is cleared or changed.
    let lastSpoken = '';

    const speakSelection = () => {
      const root = rootRef.current;
      const selection = window.getSelection();
      if (!root || !selection || selection.isCollapsed || !selection.rangeCount)
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
      const language = container?.getAttribute(SPEECH_LANGUAGE_ATTRIBUTE);
      if (!container || !language || !root.contains(container)) return;

      const key = `${language}\n${text}`;
      if (key === lastSpoken) return;
      lastSpoken = key;
      onSpeakRef.current(text, language);
    };

    const handleSelectionChange = () => {
      clearTimeout(timeout);
      if (window.getSelection()?.isCollapsed) {
        lastSpoken = '';
        return;
      }
      timeout = setTimeout(speakSelection, SELECTION_SETTLE_MS);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [rootRef]);
};
