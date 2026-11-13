'use client';

import { useEffect, useRef } from 'react';

// runChat keeps the onReplyComplete it started with, so mute and voice changes
// made during a stream must be read through refs.
export const useReplySpeech = ({
  speakReplies,
  voiceId,
  speak,
  stop,
}: {
  speakReplies: boolean;
  voiceId: string;
  speak: (text: string, options?: { voiceId?: string }) => Promise<void>;
  stop: () => void;
}) => {
  const speakRepliesRef = useRef(speakReplies);
  const voiceIdRef = useRef(voiceId);

  useEffect(() => {
    voiceIdRef.current = voiceId;
  }, [voiceId]);

  useEffect(() => {
    speakRepliesRef.current = speakReplies;
    if (!speakReplies) stop();
  }, [speakReplies, stop]);

  return {
    onReplyComplete: async (content: string) => {
      if (speakRepliesRef.current)
        await speak(content, { voiceId: voiceIdRef.current });
    },
    onInterrupt: stop,
  };
};
