export interface EmailSubscriptionRequest {
  email: string;
}

export interface MessageRequest {
  name: string;
  email: string;
  message: string;
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

export interface VibecheckLiteSubscriptionRequest {
  email: string;
  latitude: number;
  longitude: number;
}
