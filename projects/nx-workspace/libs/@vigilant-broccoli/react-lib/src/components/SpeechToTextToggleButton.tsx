'use client';

import { useState, useEffect } from 'react';
import { SpeechToTextButton as BaseSpeechToTextButton } from './SpeechToTextButton';

interface SpeechToTextToggleButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  isProcessing?: boolean;
  onToggle: () => void;
  onStopComplete?: () => Promise<void>;
}

export const SpeechToTextToggleButton = ({
  isRecording,
  isDisabled = false,
  isProcessing: externalProcessing = false,
  onToggle,
  onStopComplete,
}: SpeechToTextToggleButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localRecording, setLocalRecording] = useState(false);

  useEffect(() => {
    if (!isProcessing) setLocalRecording(isRecording);
  }, [isRecording, isProcessing]);

  const handleToggle = async () => {
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
    <BaseSpeechToTextButton
      isRecording={localRecording}
      isDisabled={isDisabled}
      isProcessing={externalProcessing || isProcessing}
      onToggle={handleToggle}
    />
  );
};
