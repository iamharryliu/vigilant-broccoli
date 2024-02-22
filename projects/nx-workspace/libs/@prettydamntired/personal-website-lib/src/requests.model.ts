export interface SubscribeRequest {
  email: string;
}

export interface MessageRequest {
  name: string;
  email: string;
  message: string;
}

export interface VibecheckLiteSubscriptionRequest {
  email: string;
  latitude: number;
  longitude: number;
}
