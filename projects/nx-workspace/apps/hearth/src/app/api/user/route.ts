import { NextRequest } from 'next/server';
import {
  createServerClient,
  createAdminClient,
} from '../../../../libs/supabase-server';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { displayName } = await req.json();
  if (typeof displayName !== 'string' || !displayName.trim()) {
    return Response.json({ error: 'displayName is required' }, { status: 400 });
  }

  const client = createServerClient(token);
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, display_name: displayName.trim() },
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
