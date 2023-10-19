interface RecaptchaRequest {
  token: string
}

export interface MessageForm {
  name: string;
  email: string;
  message: string;

}

export interface MessageRequest extends RecaptchaRequest, MessageForm { }

export interface NewsletterSubscriptionRequest {
  email: string;
}
