'use client';

import { cursorColor } from './cursor-color';
import { WhiteboardCursor } from './whiteboard-room.types';

interface PeerCursorsOverlayProps {
  cursors: WhiteboardCursor[];
  currentUserId: string;
}

// Renders peers' mouse positions as percentage offsets of the relatively
// positioned board it's overlaid on — the caller is responsible for tracking
// mouse movement and feeding coordinates back through setCursorPosition.
export function PeerCursorsOverlay({
  cursors,
  currentUserId,
}: PeerCursorsOverlayProps) {
  const peerCursors = cursors.filter(
    cursor =>
      cursor.userId !== currentUserId && cursor.x !== null && cursor.y !== null,
  );

  return (
    <>
      {peerCursors.map(cursor => (
        <div
          key={cursor.userId}
          style={{
            left: `${(cursor.x as number) * 100}%`,
            top: `${(cursor.y as number) * 100}%`,
          }}
          className="pointer-events-none absolute z-10 -translate-x-0.5 -translate-y-0.5 transition-[left,top] duration-75 ease-out"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill={cursorColor(cursor.userId)}
            className="drop-shadow"
          >
            <path d="M1 1l6.5 13.5L9 9l5.5-1.5L1 1z" />
          </svg>
          <span
            style={{ backgroundColor: cursorColor(cursor.userId) }}
            className="ml-3 -mt-1 inline-block rounded px-1.5 py-0.5 text-xs whitespace-nowrap text-white shadow"
          >
            {cursor.username}
          </span>
        </div>
      ))}
    </>
  );
}
