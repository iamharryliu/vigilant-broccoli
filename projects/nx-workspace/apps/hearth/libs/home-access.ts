import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  createAdminClient,
  createServerClient,
  getBearerToken,
} from './supabase-server';
import { HOME_ROLE } from '../src/lib/types';

// Checked with the admin client for a clear 403; writes through the user
// client are still bound by the owner/admin RLS policies.
export const canManageHome = async (homeId: string, userId: string) => {
  const admin = createAdminClient();
  const [{ data: ownedHome }, { data: adminMembership }] = await Promise.all([
    admin
      .from('homes')
      .select('id')
      .eq('id', homeId)
      .eq('user_id', userId)
      .maybeSingle(),
    admin
      .from('home_members')
      .select('id')
      .eq('home_id', homeId)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .eq('role', HOME_ROLE.ADMIN)
      .maybeSingle(),
  ]);
  return Boolean(ownedHome || adminMembership);
};

export const authorizeHomeManager = async (
  request: NextRequest,
  homeId: string,
) => {
  const supabase = createServerClient(getBearerToken(request));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: Response.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      ),
    };
  }
  if (!(await canManageHome(homeId, user.id))) {
    return {
      error: Response.json(
        { error: 'Forbidden' },
        { status: HTTP_STATUS_CODES.FORBIDDEN },
      ),
    };
  }
  return { supabase, user };
};
