'use client';

import { useState, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';

const ARIA_STOP = 'Stop recording';
const ARIA_START = 'Start recording';

interface SpeechToTextButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  onToggle: () => void;
  onStopComplete?: () => Promise<void>;
}

export const SpeechToTextButton = ({
  isRecording,
  isDisabled = false,
  onToggle,
  onStopComplete,
}: SpeechToTextButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localRecording, setLocalRecording] = useState(false);

  useEffect(() => {
    if (!isProcessing) setLocalRecording(isRecording);
  }, [isRecording, isProcessing]);

  const handleClick = async () => {
    if (isRecording && onStopComplete) {
      setLocalRecording(false);
      setIsProcessing(true);
      await onStopComplete();
      setIsProcessing(false);
    } else {
      setLocalRecording(true);
      onToggle();
    }
  };

  return (
    <Button
      size="icon"
      onClick={handleClick}
      variant={localRecording ? 'destructive' : 'outline'}
      disabled={isDisabled}
      loading={isProcessing}
      aria-label={localRecording ? ARIA_STOP : ARIA_START}
    >
      {localRecording ? <Square size={16} /> : <Mic size={16} />}
    </Button>
  );
};
