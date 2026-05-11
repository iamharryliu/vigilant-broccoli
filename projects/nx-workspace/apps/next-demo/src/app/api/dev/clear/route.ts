import { NextRequest } from 'next/server';
import {
  createServerClient,
  createAdminClient,
} from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const TABLE_MAP: Record<string, string> = {
  'calendar-events': 'calendar_events',
  'household-rules': 'household_rules',
  'home-members': 'home_members',
  'home-resources': 'resources',
  'resource-bookings': 'resource_bookings',
  'home-projects': 'home_projects',
  'leisure-activities': 'leisure_activities',
  meals: 'meals',
  docs: 'home_docs',
  'where-is': 'where_is_items',
  'price-tracker': 'price_items',
};

export async function POST(request: NextRequest) {
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const supabase = createServerClient(accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { homeId, keys } = (await request.json()) as {
    homeId: number;
    keys: string[];
  };

  if (!homeId || !Array.isArray(keys) || keys.length === 0) {
    return Response.json(
      { error: 'homeId and keys are required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const results: Record<string, string> = {};

  for (const key of keys) {
    const table = TABLE_MAP[key];
    if (!table) {
      results[key] = 'unknown key';
      continue;
    }

    if (table === 'home_members') {
      const admin = createAdminClient();
      const { data: home } = await admin
        .from('homes')
        .select('user_id')
        .eq('id', homeId)
        .maybeSingle();
      const ownerUserId = home?.user_id;
      let query = supabase.from('home_members').delete().eq('home_id', homeId);
      if (ownerUserId) {
        const { data: ownerMember } = await admin
          .from('home_members')
          .select('id')
          .eq('home_id', homeId)
          .eq('user_id', ownerUserId)
          .maybeSingle();
        if (ownerMember?.id) query = query.neq('id', ownerMember.id);
      }
      const { error } = await query;
      results[key] = error ? error.message : 'ok';
      continue;
    }

    const { error } = await supabase.from(table).delete().eq('home_id', homeId);
    results[key] = error ? error.message : 'ok';
  }

  return Response.json({ results });
}
