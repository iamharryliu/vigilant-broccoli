import { Mic, Square } from 'lucide-react';
import { Button } from './Button';

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
  <Button
    size="icon"
    onClick={onToggle}
    variant={isRecording && !isProcessing ? 'destructive' : 'outline'}
    disabled={isDisabled}
    loading={isProcessing}
    aria-label={isRecording ? ARIA_STOP : ARIA_START}
  >
    {isRecording ? <Square size={16} /> : <Mic size={16} />}
  </Button>
);
