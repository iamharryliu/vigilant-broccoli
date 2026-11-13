export interface ChatbotImage {
  data: string;
  mimeType: string;
}

export interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  // Only chat-model replies can be regenerated; command results are not.
  isChatReply?: boolean;
  // Shown instead of `content` when the sent text is not what the user typed.
  displayContent?: string;
  images?: ChatbotImage[];
}

export type SetChatbotMessages<M extends ChatbotMessage> = React.Dispatch<
  React.SetStateAction<M[]>
>;
