import { IconButton } from './IconButton';

const ARIA_SEND = 'Send message';
const ARIA_STOP = 'Stop response';

interface ChatSendButtonProps {
  isStreaming: boolean;
  isDisabled?: boolean;
  onSend: () => void;
  onStop: () => void;
}

export const ChatSendButton = ({
  isStreaming,
  isDisabled = false,
  onSend,
  onStop,
}: ChatSendButtonProps) =>
  isStreaming ? (
    <IconButton
      icon="stop"
      variant="outline"
      onClick={onStop}
      aria-label={ARIA_STOP}
    />
  ) : (
    <IconButton
      icon="send-horizontal"
      variant="outline"
      onClick={onSend}
      disabled={isDisabled}
      aria-label={ARIA_SEND}
    />
  );
