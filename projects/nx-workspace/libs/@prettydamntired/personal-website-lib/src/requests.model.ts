export interface SubscribeRequest {
  email: string;
}

export interface MessageRequest {
  appName: string;
  name: string;
  email: string;
  message: string;
}

export interface VibecheckLiteSubscriptionRequest {
  email: string;
  latitude: number;
  longitude: number;
}
