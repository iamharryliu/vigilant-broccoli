export interface Email {
  from?: string;
  to: string[];
  subject: string;
  text?: string;
  cc?: string[];
  attachments?: Attachment[];
}

type Attachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  path?: string;
};
