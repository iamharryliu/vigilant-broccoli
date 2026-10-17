import {
  VisuallyHidden,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { PersonalCalendarComponent } from './personal-calendar.component';

interface CalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarDialog = ({ open, onOpenChange }: CalendarDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
        aria-describedby={undefined}
        showCloseButton={false}
        style={{
          maxWidth: '90vw',
          width: '90vw',
          height: '90vh',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <VisuallyHidden>
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            Calendar
          </DialogTitle>
        </VisuallyHidden>
        <PersonalCalendarComponent className="h-full" />
      </DialogContent>
    </Dialog>
  );
};
