import { useState } from 'react';
import { AudioButton } from '@vigilant-broccoli/react-lib';

const MOCK_SPEAK_MS = 2000;

export function AudioButtonDemo() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSpeak = (_text: string, id: string) => {
    setActiveId(id);
    setTimeout(() => setActiveId(null), MOCK_SPEAK_MS);
  };

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <AudioButton
        text="Hello, world!"
        id="idle"
        activeId={activeId}
        onSpeak={handleSpeak}
      />
      <AudioButton
        text=""
        id="loading"
        activeId="loading"
        onSpeak={handleSpeak}
      />
      <AudioButton
        text="Disabled while another plays"
        id="other"
        activeId={activeId}
        onSpeak={handleSpeak}
      />
    </div>
  );
}
