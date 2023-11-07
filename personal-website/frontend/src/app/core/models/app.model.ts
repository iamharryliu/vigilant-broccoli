interface RecaptchaRequest {
  token: string;
}

export interface MessageForm {
  name: string;
  email: string;
  message: string;
}

export interface EmailSubscriptionRequest {
  email: string;
}

export interface MessageRequest extends RecaptchaRequest, MessageForm {}

export interface NewsletterSubscriptionRequest {
  email: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Link {
  url: string;
  text: string;
  target?: string;
  isExternalLink?: boolean;
  isButton?: boolean;
}
