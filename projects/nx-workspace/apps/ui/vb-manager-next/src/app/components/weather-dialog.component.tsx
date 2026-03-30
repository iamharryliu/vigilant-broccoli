'use client';

import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { WeatherComponent } from './weather.component';

interface WeatherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WeatherDialog = ({ open, onOpenChange }: WeatherDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{ maxWidth: '600px', width: '90vw', padding: '1.5rem' }}
      >
        <VisuallyHidden>
          <Dialog.Title>Weather</Dialog.Title>
        </VisuallyHidden>
        <WeatherComponent />
      </Dialog.Content>
    </Dialog.Root>
  );
};
