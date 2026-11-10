export interface MessageImage {
  data: string;
  mimeType: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  // Only chat-model replies can be regenerated.
  isChatReply?: boolean;
  images?: MessageImage[];
}

export type SetMessages = React.Dispatch<React.SetStateAction<Message[]>>;
