import { Loader2, Volume2 } from 'lucide-react';

type AudioButtonProps = {
  text: string;
  id: string;
  activeId: string | null;
  onSpeak: (text: string, id: string) => void;
};

export function AudioButton({ text, id, activeId, onSpeak }: AudioButtonProps) {
  const isLoading = activeId === id;
  return (
    <button
      onClick={() => onSpeak(text, id)}
      disabled={activeId !== null}
      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 transition-colors"
      aria-label="Play audio"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin text-gray-500" />
      ) : (
        <Volume2 size={16} className="text-gray-500" />
      )}
    </button>
  );
}
