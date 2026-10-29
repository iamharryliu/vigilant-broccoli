'use client';

import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { CreateCalendarEventDialog } from '@vigilant-broccoli/react-lib-higher-level';
import { authFetch } from '../../../libs/auth';
import { TaskVoiceButton } from './task-voice-button.component';
import { useTranslation } from '../i18n';

export const CreateCalendarEventDialogTrigger = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
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
        onOpenChange={setOpen}
        authFetch={authFetch}
        renderVoiceAction={onTranscript => (
          <TaskVoiceButton onTranscript={onTranscript} />
        )}
      />
    </>
  );
};
