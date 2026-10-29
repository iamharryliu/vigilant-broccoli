'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { X } from 'lucide-react';
import { CalendarInput, type CalendarInputProps } from './CalendarInput';
import { CalendarEventI18nProvider, useCalendarEventTranslation } from './i18n';

// Matches the breakpoint where the dialog stops being full screen.
const DESKTOP_MEDIA_QUERY = '(min-width: 640px)';

export interface CreateCalendarEventDialogProps extends Omit<
  CalendarInputProps,
  'header'
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CalendarEventDialogContent = ({
  onOpenChange,
  ...inputProps
}: Omit<CreateCalendarEventDialogProps, 'open'>) => {
  const { t } = useCalendarEventTranslation();
  return (
    <DialogContent
      fullScreenOnMobile
      className="flex flex-col gap-0 overflow-hidden p-0 max-sm:!overflow-hidden sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-[600px]"
      aria-describedby={undefined}
      showCloseButton={false}
      onOpenAutoFocus={event => {
        // Avoid opening the phone keyboard until the user asks for it.
        event.preventDefault();
        if (!window.matchMedia(DESKTOP_MEDIA_QUERY).matches) return;
        (event.currentTarget as HTMLElement).querySelector('textarea')?.focus();
      }}
    >
      <CalendarInput
        {...inputProps}
        header={
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] sm:px-6 sm:pt-6">
            <DialogTitle className="text-xl font-bold leading-7 tracking-normal">
              {t('TITLE')}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('CLOSE')}
              title={t('CLOSE')}
              onClick={() => onOpenChange(false)}
            >
              <X size={18} aria-hidden="true" />
            </Button>
          </div>
        }
      />
    </DialogContent>
  );
};

export const CreateCalendarEventDialog = ({
  open,
  onOpenChange,
  ...inputProps
}: CreateCalendarEventDialogProps) => (
  <CalendarEventI18nProvider>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CalendarEventDialogContent onOpenChange={onOpenChange} {...inputProps} />
    </Dialog>
  </CalendarEventI18nProvider>
);
