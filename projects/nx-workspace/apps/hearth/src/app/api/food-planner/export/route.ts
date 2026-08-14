import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const KITCHEN_BOARD_KEY = 'kitchen';

interface ExportChecklistItem {
  name: string;
  completed: boolean;
  completedAt: string | null;
  position: number;
}

export interface FoodPlannerExport {
  version: 1;
  exportedAt: string;
  homeId: number;
  groceryItems: ExportChecklistItem[];
  kitchenChoreItems: ExportChecklistItem[];
  kitchenNotes: string;
}

const toExportItem = (row: Record<string, unknown>): ExportChecklistItem => ({
  name: row.name as string,
  completed: row.completed as boolean,
  completedAt: (row.completed_at as string | null) ?? null,
  position: row.position as number,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const homeId = searchParams.get('homeId');
  const supabase = createServerClient(getBearerToken(request));

  if (!homeId) {
    return Response.json(
      { error: 'homeId is required.' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const [
    { data: groceryItems },
    { data: kitchenChoreItems },
    { data: whiteboard },
  ] = await Promise.all([
    supabase
      .from('grocery_items')
      .select('*')
      .eq('home_id', homeId)
      .order('position', { ascending: true }),
    supabase
      .from('kitchen_chore_items')
      .select('*')
      .eq('home_id', homeId)
      .order('position', { ascending: true }),
    supabase
      .from('whiteboards')
      .select('content')
      .eq('home_id', homeId)
      .eq('board_key', KITCHEN_BOARD_KEY)
      .maybeSingle(),
  ]);

  const exportData: FoodPlannerExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    homeId: Number(homeId),
    groceryItems: (groceryItems ?? []).map(toExportItem),
    kitchenChoreItems: (kitchenChoreItems ?? []).map(toExportItem),
    kitchenNotes: whiteboard?.content ?? '',
  };

  return new Response(JSON.stringify(exportData), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="food-planner-export-${homeId}-${Date.now()}.json"`,
    },
  });
}
