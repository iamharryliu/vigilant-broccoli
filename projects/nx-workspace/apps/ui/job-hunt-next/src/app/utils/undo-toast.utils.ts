import { toast } from '@vigilant-broccoli/react-lib/toaster';

const UNDO_TOAST_DURATION_MS = 8000;

// Bottom-left keeps the undo clear of the bottom-right status toasts.
export const undoToast = (
  message: string,
  undoLabel: string,
  onUndo: () => void,
) =>
  toast(message, {
    position: 'bottom-left',
    duration: UNDO_TOAST_DURATION_MS,
    action: { label: undoLabel, onClick: onUndo },
  });
