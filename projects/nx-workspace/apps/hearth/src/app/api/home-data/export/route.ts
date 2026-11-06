import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { HOME_DATA_EXPORT_GROUPS } from '../../../../lib/export-groups';

export const runtime = 'nodejs';

// PostgREST caps a response at 1000 rows by default.
const PAGE_SIZE = 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const homeId = searchParams.get('homeId');
  const group = HOME_DATA_EXPORT_GROUPS.find(
    ({ key }) => key === searchParams.get('group'),
  );

  if (!homeId || !group) {
    return Response.json(
      { error: 'homeId and a valid group are required.' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const supabase = createServerClient(getBearerToken(request));

  const fetchAll = async (table: string, select: string) => {
    const rows: unknown[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq('home_id', homeId)
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(`${table}: ${error.message}`);
      rows.push(...data);
      if (data.length < PAGE_SIZE) return rows;
    }
  };

  try {
    const entries = await Promise.all(
      group.tables.map(
        async ({ name, table, select = '*' }) =>
          [name, await fetchAll(table, select)] as const,
      ),
    );

    return new Response(
      JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        homeId: Number(homeId),
        group: group.key,
        data: Object.fromEntries(entries),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${group.key}-export-${homeId}-${Date.now()}.json"`,
        },
      },
    );
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
