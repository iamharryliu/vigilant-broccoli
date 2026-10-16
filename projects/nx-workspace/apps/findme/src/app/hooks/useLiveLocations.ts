'use client';

import {
  LiveLocationsState,
  SupabaseLike,
  useLiveLocations as useSharedLiveLocations,
} from '@vigilant-broccoli/react-lib-higher-level';
import { supabase } from '../../lib/supabase';

const CHANNEL_NAME = 'live-locations';

export {
  CONNECTION_STATUS,
  isSharingUser,
} from '@vigilant-broccoli/react-lib-higher-level';
export type {
  ConnectionStatus,
  LiveUser,
  SharingUser,
  LiveLocationsState,
} from '@vigilant-broccoli/react-lib-higher-level';

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
