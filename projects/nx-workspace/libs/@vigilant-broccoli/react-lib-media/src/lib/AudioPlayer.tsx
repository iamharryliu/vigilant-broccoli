import { MutableRefObject } from 'react';

export default function AudioPlayer({
  audioUrl,
  audioRef,
}: {
  audioUrl: string;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
}) {
  return (
    <div>
      {audioUrl && (
        <audio
          className="w-full rounded-lg"
          ref={audioRef}
          controls
          src={audioUrl}
        />
      )}
    </div>
  );
}
