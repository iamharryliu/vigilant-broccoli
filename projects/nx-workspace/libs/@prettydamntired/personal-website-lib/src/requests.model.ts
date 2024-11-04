import { AppName } from '.';

export interface SubscribeRequest {
  email: string;
}

export interface MessageRequest {
  appName: AppName;
  name: string;
  email: string;
  message: string;
}

export interface VibecheckLiteSubscriptionRequest {
  email: string;
  latitude: number;
  longitude: number;
}

export interface ImageAlbum {
  albumName: string;
  firstImageUrl: string;
}
