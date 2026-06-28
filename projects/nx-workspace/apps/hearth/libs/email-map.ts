import { createAdminClient } from './supabase-server';

export async function buildEmailMap(
  userIds: string[],
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};
  const admin = createAdminClient();
  const { data } = await admin
    .from('home_members')
    .select('user_id, email')
    .in('user_id', userIds);
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.user_id && row.email) map[row.user_id] = row.email;
  }
  const missing = userIds.filter(id => !map[id]);
  await Promise.all(
    missing.map(async id => {
      const { data: authUser } = await admin.auth.admin.getUserById(id);
      if (authUser?.user?.email) map[id] = authUser.user.email;
    }),
  );
  return map;
}
