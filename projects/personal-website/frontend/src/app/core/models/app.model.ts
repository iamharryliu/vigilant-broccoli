// todo: use general lib
export interface SubscribeRequest {
  email: string;
}

// todo: use general lib
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
