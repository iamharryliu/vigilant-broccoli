export interface Email {
  from?: string;
  to: string | string[];
  subject: string;
  text?: string;
  cc?: string[];
  attachments?: Attachment[];
  html?: string;
}

type Attachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  path?: string;
};

export interface EjsTemplate {
  path: string;
  data?: Record<string, string>;
}
