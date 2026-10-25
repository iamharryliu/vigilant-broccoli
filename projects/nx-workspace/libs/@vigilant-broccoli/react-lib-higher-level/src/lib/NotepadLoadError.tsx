'use client';

import { Button, Text } from '@vigilant-broccoli/react-lib';

const LOAD_ERROR_TEXT = "Couldn't load these notes; editing is paused.";
const RETRY_LABEL = 'Retry';

interface NotepadLoadErrorProps {
  loadError: string | null;
  onRetry: () => void;
}

export const NotepadLoadError = ({
  loadError,
  onRetry,
}: NotepadLoadErrorProps) => {
  if (!loadError) return null;
  return (
    <div className="mb-2 flex items-center gap-2" role="alert">
      <Text size="2" color="red">
        {LOAD_ERROR_TEXT}
      </Text>
      <Button size="sm" variant="outline" onClick={onRetry}>
        {RETRY_LABEL}
      </Button>
    </div>
  );
};
