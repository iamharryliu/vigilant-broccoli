import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { name, description, accessToken } = await request.json();
  const supabase = createServerClient(accessToken);

  const { error } = await supabase
    .from('homes')
    .update({ name, description })
    .eq('id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json({ success: true });
}
