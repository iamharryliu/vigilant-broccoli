import type { ComponentProps } from 'react';
import { IconButton } from './IconButton';

const ARIA_SEND = 'Send message';
const ARIA_STOP = 'Stop response';

interface ChatSendButtonProps {
  isStreaming: boolean;
  isDisabled?: boolean;
  onSend: () => void;
  onStop: () => void;
  variant?: ComponentProps<typeof IconButton>['variant'];
}

export const ChatSendButton = ({
  isStreaming,
  isDisabled = false,
  onSend,
  onStop,
  variant = 'outline',
}: ChatSendButtonProps) =>
  isStreaming ? (
    <IconButton
      icon="stop"
      variant={variant}
      onClick={onStop}
      aria-label={ARIA_STOP}
    />
  ) : (
    <IconButton
      icon="send-horizontal"
      variant={variant}
      onClick={onSend}
      disabled={isDisabled}
      aria-label={ARIA_SEND}
    />
  );
