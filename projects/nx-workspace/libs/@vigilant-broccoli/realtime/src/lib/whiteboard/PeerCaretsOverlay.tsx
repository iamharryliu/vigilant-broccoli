'use client';

import { RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { CaretCoordinates, getCaretCoordinates } from './caret-position';
import { cursorColor } from './cursor-color';
import { WhiteboardCursor } from './whiteboard-room.types';

const SCROLL_EVENT = 'scroll';

interface PeerCaretsOverlayProps {
  cursors: WhiteboardCursor[];
  currentUserId: string;
  content: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

// Renders peers' text-selection carets by measuring each cursor's character
// index against the shared textarea's own font metrics and scroll offset.
export function PeerCaretsOverlay({
  cursors,
  currentUserId,
  content,
  textareaRef,
}: PeerCaretsOverlayProps) {
  // Memoized so its identity only changes when cursor data actually does —
  // otherwise the recompute effect below (keyed on this array) would re-fire
  // on every render, call setCaretPositions with a brand-new object each
  // time, and loop forever ("Maximum update depth exceeded").
  const peerTextCursors = useMemo(
    () =>
      cursors.filter(
        cursor => cursor.userId !== currentUserId && cursor.index !== null,
      ),
    [cursors, currentUserId],
  );

  const [caretPositions, setCaretPositions] = useState<
    Record<string, CaretCoordinates>
  >({});

  const recomputeCaretPositions = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const next: Record<string, CaretCoordinates> = {};
    peerTextCursors.forEach(cursor => {
      const index = Math.min(cursor.index as number, content.length);
      const coords = getCaretCoordinates(textarea, index);
      next[cursor.userId] = {
        top: coords.top - textarea.scrollTop,
        left: coords.left - textarea.scrollLeft,
        height: coords.height,
      };
    });
    setCaretPositions(next);
  }, [peerTextCursors, content, textareaRef]);

  useEffect(() => {
    recomputeCaretPositions();
  }, [recomputeCaretPositions]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.addEventListener(SCROLL_EVENT, recomputeCaretPositions);
    return () =>
      textarea.removeEventListener(SCROLL_EVENT, recomputeCaretPositions);
  }, [recomputeCaretPositions, textareaRef]);

  return (
    <>
      {peerTextCursors.map(cursor => {
        const position = caretPositions[cursor.userId];
        if (!position) return null;
        return (
          <div
            key={cursor.userId}
            style={{
              top: position.top,
              left: position.left,
              height: position.height,
            }}
            className="pointer-events-none absolute z-10 overflow-visible"
          >
            <span
              style={{ backgroundColor: cursorColor(cursor.userId) }}
              className="block h-full w-0.5 animate-pulse"
            />
            <span
              style={{ backgroundColor: cursorColor(cursor.userId) }}
              className="absolute bottom-full left-0 mb-0.5 inline-block rounded px-1.5 py-0.5 text-xs whitespace-nowrap text-white shadow"
            >
              {cursor.username}
            </span>
          </div>
        );
      })}
    </>
  );
}
