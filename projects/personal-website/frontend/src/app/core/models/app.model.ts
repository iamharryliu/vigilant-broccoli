export interface SubscribeRequest {
  email: string;
}

export interface MessageRequest {
  name: string;
  email: string;
  message: string;
}

export interface Link {
  url: {
    internal?: string;
    external: string;
  };
  text: string;
}

export interface VibecheckLiteSubscriptionRequest {
  email: string;
  latitude: number;
  longitude: number;
}
