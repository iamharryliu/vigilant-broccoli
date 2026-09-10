import { NextRequest } from 'next/server';
import {
  createServerClient,
  createAdminClient,
} from '../../../../libs/supabase-server';
import {
  RENAME_ENABLED_KEY,
  RENAME_LANGUAGE_KEY,
  RENAME_LANGUAGES,
} from '../../../lib/types';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { displayName, renameEnabled, renameLanguage } = await req.json();

  const metadataUpdate: Record<string, unknown> = {};

  if (displayName !== undefined) {
    if (typeof displayName !== 'string' || !displayName.trim()) {
      return Response.json(
        { error: 'displayName is required' },
        { status: 400 },
      );
    }
    metadataUpdate.display_name = displayName.trim();
  }

  if (renameEnabled !== undefined) {
    if (typeof renameEnabled !== 'boolean') {
      return Response.json(
        { error: 'renameEnabled must be a boolean' },
        { status: 400 },
      );
    }
    metadataUpdate[RENAME_ENABLED_KEY] = renameEnabled;
  }

  if (renameLanguage !== undefined) {
    // The language is interpolated into the parser's system prompt, so it is
    // restricted to the known set rather than passed through as free text.
    if (!RENAME_LANGUAGES.includes(renameLanguage)) {
      return Response.json(
        { error: 'Unsupported renameLanguage' },
        { status: 400 },
      );
    }
    metadataUpdate[RENAME_LANGUAGE_KEY] = renameLanguage;
  }

  if (Object.keys(metadataUpdate).length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 });
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
    user_metadata: { ...user.user_metadata, ...metadataUpdate },
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
