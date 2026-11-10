import type { ComponentProps } from 'react';
import { IconButton } from './IconButton';

const ARIA_STOP = 'Stop recording';
const ARIA_START = 'Start recording';

interface SpeechToTextButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  isProcessing?: boolean;
  onToggle: () => void;
  variant?: ComponentProps<typeof IconButton>['variant'];
}

export const SpeechToTextButton = ({
  isRecording,
  isDisabled = false,
  isProcessing = false,
  onToggle,
  variant = 'outline',
}: SpeechToTextButtonProps) => (
  <IconButton
    icon={isRecording ? 'stop' : 'mic'}
    onClick={onToggle}
    variant={isRecording && !isProcessing ? 'destructive' : variant}
    disabled={isDisabled}
    loading={isProcessing}
    aria-label={isRecording ? ARIA_STOP : ARIA_START}
  />
);
