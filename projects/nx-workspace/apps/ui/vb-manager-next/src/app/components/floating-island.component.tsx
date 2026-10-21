'use client';

import { useState, useRef } from 'react';
import { EmailModalComponent } from './email-modal.component';
import { SearchDialogComponent } from './search-dialog.component';
import { CalendarDialog } from './calendar-dialog.component';
import { NotepadDialog } from './notepad-dialog.component';
import { UtilitiesDialog } from './utilities-dialog.component';
import {
  AlarmEngine,
  ClockComponent,
  TimerEngine,
} from '@vigilant-broccoli/react-utility';
import { useDrag } from '../hooks/useDrag';

interface FloatingIslandProps {
  searchDialogOpen?: boolean;
  setSearchDialogOpen?: (open: boolean) => void;
  emailDialogOpen?: boolean;
  setEmailDialogOpen?: (open: boolean) => void;
  calendarDialogOpen?: boolean;
  setCalendarDialogOpen?: (open: boolean) => void;
  notepadDialogOpen?: boolean;
  setNotepadDialogOpen?: (open: boolean) => void;
  utilitiesDialogOpen?: boolean;
  setUtilitiesDialogOpen?: (open: boolean) => void;
}

const getDialogState = (
  externalOpen: boolean | undefined,
  internalOpen: boolean,
): boolean => externalOpen ?? internalOpen;

// eslint-disable-next-line complexity
export const FloatingIslandComponent = ({
  searchDialogOpen: externalSearchOpen,
  setSearchDialogOpen: externalSetSearchOpen,
  emailDialogOpen: externalEmailOpen,
  setEmailDialogOpen: externalSetEmailOpen,
  calendarDialogOpen: externalCalendarOpen,
  setCalendarDialogOpen: externalSetCalendarOpen,
  notepadDialogOpen: externalNotepadOpen,
  setNotepadDialogOpen: externalSetNotepadOpen,
  utilitiesDialogOpen: externalUtilitiesOpen,
  setUtilitiesDialogOpen: externalSetUtilitiesOpen,
}: FloatingIslandProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { position, isDragging, handlePointerDown } = useDrag(containerRef);
  const [internalEmailDialogOpen, setInternalEmailDialogOpen] = useState(false);
  const [internalSearchDialogOpen, setInternalSearchDialogOpen] =
    useState(false);
  const [internalCalendarDialogOpen, setInternalCalendarDialogOpen] =
    useState(false);
  const [internalNotepadDialogOpen, setInternalNotepadDialogOpen] =
    useState(false);
  const [internalUtilitiesDialogOpen, setInternalUtilitiesDialogOpen] =
    useState(false);
  const searchDialogOpen = getDialogState(
    externalSearchOpen,
    internalSearchDialogOpen,
  );
  const setSearchDialogOpen =
    externalSetSearchOpen ?? setInternalSearchDialogOpen;
  const emailDialogOpen = getDialogState(
    externalEmailOpen,
    internalEmailDialogOpen,
  );
  const setEmailDialogOpen = externalSetEmailOpen ?? setInternalEmailDialogOpen;
  const calendarDialogOpen = getDialogState(
    externalCalendarOpen,
    internalCalendarDialogOpen,
  );
  const setCalendarDialogOpen =
    externalSetCalendarOpen ?? setInternalCalendarDialogOpen;
  const notepadDialogOpen = getDialogState(
    externalNotepadOpen,
    internalNotepadDialogOpen,
  );
  const setNotepadDialogOpen =
    externalSetNotepadOpen ?? setInternalNotepadDialogOpen;
  const utilitiesDialogOpen = getDialogState(
    externalUtilitiesOpen,
    internalUtilitiesDialogOpen,
  );
  const setUtilitiesDialogOpen =
    externalSetUtilitiesOpen ?? setInternalUtilitiesDialogOpen;

  return (
    <>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'row',
          gap: '1.5rem',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor:
            'color-mix(in srgb, var(--color-background) 50%, transparent)',
          borderRadius: '0.75rem',
          border: '1px solid var(--gray-6)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: isDragging ? 'none' : 'auto',
          touchAction: 'none',
          visibility: position.x < 0 ? 'hidden' : 'visible',
        }}
      >
        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="time" />
        </div>

        <div
          style={{
            width: '1px',
            height: '60px',
            backgroundColor: 'var(--gray-6)',
          }}
        />

        <div style={{ minWidth: 'max-content' }}>
          <ClockComponent type="info" />
        </div>
      </div>

      <EmailModalComponent
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
      <SearchDialogComponent
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
      />
      <CalendarDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
      />
      <NotepadDialog
        open={notepadDialogOpen}
        onOpenChange={setNotepadDialogOpen}
      />
      <UtilitiesDialog
        open={utilitiesDialogOpen}
        onOpenChange={setUtilitiesDialogOpen}
      />
      <AlarmEngine />
      <TimerEngine />
    </>
  );
};
