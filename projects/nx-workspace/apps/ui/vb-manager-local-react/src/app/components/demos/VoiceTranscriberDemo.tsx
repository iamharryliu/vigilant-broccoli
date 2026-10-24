import { useState } from 'react';
import { Button, CopyButton } from '@vigilant-broccoli/react-lib';
import { SpeechToText } from '../llm/SpeechToText';

const CLEAR_LABEL = 'Clear';

export const VoiceTranscriberDemo = () => {
  const [transcript, setTranscript] = useState('');
  // Remount to clear: SpeechToText owns its textarea state.
  const [resetKey, setResetKey] = useState(0);
  const hasText = transcript.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      <SpeechToText key={resetKey} onTranscript={setTranscript} />
      <div className="flex items-center gap-2">
        <CopyButton text={transcript.trim()} />
        <Button
          variant="outline"
          disabled={!hasText}
          onClick={() => {
            setTranscript('');
            setResetKey(key => key + 1);
          }}
        >
          {CLEAR_LABEL}
        </Button>
      </div>
    </div>
  );
};
