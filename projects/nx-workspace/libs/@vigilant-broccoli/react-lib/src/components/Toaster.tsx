import { CSSProperties } from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

// Sonner floats the close button over the card's top-left corner; these vars pin it inside the top-right.
const CLOSE_BUTTON_STYLE = {
  '--toast-close-button-start': 'unset',
  '--toast-close-button-end': '8px',
  '--toast-close-button-transform': 'translateY(8px)',
} as CSSProperties;

export const Toaster = ({
  style,
  ...props
}: React.ComponentProps<typeof SonnerToaster>) => (
  <SonnerToaster style={{ ...CLOSE_BUTTON_STYLE, ...style }} {...props} />
);

export { toast };
