'use client';

import {
  VisuallyHidden,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { HARRYLIU_APP_URL } from '@vigilant-broccoli/links';

const IFRAME_PERMISSION = {
  GEOLOCATION: 'geolocation',
} as const;

interface WeatherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WeatherDialog = ({ open, onOpenChange }: WeatherDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="block gap-0 overflow-hidden"
        aria-describedby={undefined}
        showCloseButton={false}
        style={{
          maxWidth: '900px',
          width: '90vw',
          height: '85dvh',
          padding: 0,
        }}
      >
        <VisuallyHidden>
          <DialogTitle>{HARRYLIU_APP_URL.WEATHER.NAME}</DialogTitle>
        </VisuallyHidden>
        <iframe
          src={HARRYLIU_APP_URL.WEATHER.URL}
          title={HARRYLIU_APP_URL.WEATHER.NAME}
          allow={IFRAME_PERMISSION.GEOLOCATION}
          className="h-full w-full"
          style={{ border: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
};
