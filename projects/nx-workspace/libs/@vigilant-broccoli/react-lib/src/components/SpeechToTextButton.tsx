import { IconButton } from './IconButton';

const ARIA_STOP = 'Stop recording';
const ARIA_START = 'Start recording';

interface SpeechToTextButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  isProcessing?: boolean;
  onToggle: () => void;
}

export const SpeechToTextButton = ({
  isRecording,
  isDisabled = false,
  isProcessing = false,
  onToggle,
}: SpeechToTextButtonProps) => (
  <IconButton
    icon={isRecording ? 'stop' : 'mic'}
    onClick={onToggle}
    variant={isRecording && !isProcessing ? 'destructive' : 'outline'}
    disabled={isDisabled}
    loading={isProcessing}
    aria-label={isRecording ? ARIA_STOP : ARIA_START}
  />
);
