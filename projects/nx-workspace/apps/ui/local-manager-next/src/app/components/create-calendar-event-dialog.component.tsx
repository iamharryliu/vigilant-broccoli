'use client';

import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { CALENDAR_EVENT_BOOKMARKLET } from '@vigilant-broccoli/common-js';
import {
  CreateCalendarEventDialog,
  useCalendarEventBookmarklet,
} from '@vigilant-broccoli/react-lib-calendar';
import { authFetch } from '../../../libs/auth';
import {
  AddEventSourceDialog,
  SourceDetection,
} from './add-event-source-dialog.component';
import { TaskVoiceButton } from './task-voice-button.component';
import { useTranslation } from '../i18n';

export const CreateCalendarEventDialogTrigger = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sourceDetection, setSourceDetection] =
    useState<SourceDetection | null>(null);
  // Two bookmarklets share this handshake: the managed-calendar one tracks the
  // page as a calendar source; the other (and any installed before intents
  // existed) imports events once.
  const { prefill, clearPrefill } = useCalendarEventBookmarklet(message => {
    if (message.intent === CALENDAR_EVENT_BOOKMARKLET.INTENT.SOURCE) {
      setSourceDetection(message);
    } else {
      setOpen(true);
    }
  });
  return (
    <>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={t('CALENDAR_CREATE.TITLE')}
        title={t('CALENDAR_CREATE.TITLE')}
        className="h-10 w-10 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
      >
        <CalendarPlus size={18} />
      </Button>
      <CreateCalendarEventDialog
        open={open}
        onOpenChange={next => {
          setOpen(next);
          if (!next) clearPrefill();
        }}
        initialText={prefill}
        autoParse={!!prefill}
        authFetch={authFetch}
        renderVoiceAction={onTranscript => (
          <TaskVoiceButton onTranscript={onTranscript} />
        )}
      />
      <AddEventSourceDialog
        detection={sourceDetection}
        onClose={() => {
          setSourceDetection(null);
          clearPrefill();
        }}
      />
    </>
  );
};
