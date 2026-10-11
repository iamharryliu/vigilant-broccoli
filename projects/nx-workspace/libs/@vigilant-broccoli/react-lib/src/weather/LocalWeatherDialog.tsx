'use client';

import { Dialog, DialogContent, DialogTitle } from '../components/Dialog';
import { VisuallyHidden } from '../components/VisuallyHidden';
import { LocalWeatherPanel, LocalWeatherPanelProps } from './LocalWeatherPanel';

const DIALOG_TITLE = 'Weather';

export interface LocalWeatherDialogProps extends LocalWeatherPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LocalWeatherDialog = ({
  open,
  onOpenChange,
  ...panelProps
}: LocalWeatherDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="max-h-[90dvh] w-[90vw] max-w-xl overflow-y-auto"
      aria-describedby={undefined}
    >
      <VisuallyHidden>
        <DialogTitle>{DIALOG_TITLE}</DialogTitle>
      </VisuallyHidden>
      {open && <LocalWeatherPanel {...panelProps} />}
    </DialogContent>
  </Dialog>
);
