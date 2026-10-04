'use client';

import {
  VisuallyHidden,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { WeatherComponent } from './weather.component';

interface WeatherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WeatherDialog = ({ open, onOpenChange }: WeatherDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
        aria-describedby={undefined}
        showCloseButton={false}
        style={{ maxWidth: '600px', width: '90vw', padding: '1.5rem' }}
      >
        <VisuallyHidden>
          <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
            Weather
          </DialogTitle>
        </VisuallyHidden>
        <WeatherComponent />
      </DialogContent>
    </Dialog>
  );
};
