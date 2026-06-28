'use client';

import {
  LiveLocationsState,
  SupabaseLike,
  useLiveLocations as useSharedLiveLocations,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../lib/supabase';

const CHANNEL_NAME = 'live-locations';

export { CONNECTION_STATUS, isSharingUser } from '@vigilant-broccoli/react-lib';
export type {
  ConnectionStatus,
  LiveUser,
  SharingUser,
  LiveLocationsState,
} from '@vigilant-broccoli/react-lib';

export function useLiveLocations(
  userId: string,
  username: string,
  lat: number | null,
  lng: number | null,
): LiveLocationsState {
  return useSharedLiveLocations(
    supabase as unknown as SupabaseLike,
    CHANNEL_NAME,
    userId,
    username,
    lat,
    lng,
  );
}
