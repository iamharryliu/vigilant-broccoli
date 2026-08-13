import { NextRequest } from 'next/server';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';

const KITCHEN_BOARD_KEY = 'kitchen';
const HOME_BOARD_CONFLICT = 'home_id,board_key';
const MAX_IMPORT_ITEMS = 500;

interface ImportChecklistItem {
  name: string;
  completed?: boolean;
  completedAt?: string | null;
  position?: number;
}

interface FoodPlannerImport {
  version: number;
  groceryItems?: ImportChecklistItem[];
  kitchenChoreItems?: ImportChecklistItem[];
  kitchenNotes?: string;
}

const insertChecklistItems = async (
  supabase: ReturnType<typeof createServerClient>,
  table: string,
  homeId: number,
  items: ImportChecklistItem[],
) => {
  let imported = 0;

  for (const item of items) {
    const { error } = await supabase.from(table).insert({
      name: item.name,
      completed: item.completed ?? false,
      completed_at: item.completed ? (item.completedAt ?? null) : null,
      position: item.position ?? 0,
      home_id: homeId,
    });

    if (!error) imported++;
  }

  return imported;
};

const validateImport = (
  homeId: number,
  groceryItems: ImportChecklistItem[],
  kitchenChoreItems: ImportChecklistItem[],
  kitchenNotes: string | undefined,
) => {
  if (!homeId) return 'homeId is required.';

  if (
    !groceryItems.length &&
    !kitchenChoreItems.length &&
    kitchenNotes === undefined
  ) {
    return 'No data to import.';
  }

  if (
    groceryItems.length > MAX_IMPORT_ITEMS ||
    kitchenChoreItems.length > MAX_IMPORT_ITEMS
  ) {
    return `Cannot import more than ${MAX_IMPORT_ITEMS} items at once.`;
  }

  return null;
};

export async function POST(request: NextRequest) {
  const { importData, homeId } = (await request.json()) as {
    importData: FoodPlannerImport;
    homeId: number;
  };
  const supabase = createServerClient(getBearerToken(request));

  const groceryItems = importData?.groceryItems ?? [];
  const kitchenChoreItems = importData?.kitchenChoreItems ?? [];
  const kitchenNotes = importData?.kitchenNotes;

  const validationError = validateImport(
    homeId,
    groceryItems,
    kitchenChoreItems,
    kitchenNotes,
  );
  if (validationError) {
    return Response.json(
      { error: validationError },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const [importedGroceryItems, importedKitchenChoreItems] = await Promise.all([
    insertChecklistItems(supabase, 'grocery_items', homeId, groceryItems),
    insertChecklistItems(
      supabase,
      'kitchen_chore_items',
      homeId,
      kitchenChoreItems,
    ),
  ]);

  if (kitchenNotes !== undefined) {
    await supabase.from('whiteboards').upsert(
      {
        home_id: homeId,
        board_key: KITCHEN_BOARD_KEY,
        content: kitchenNotes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: HOME_BOARD_CONFLICT },
    );
  }

  return Response.json({
    success: true,
    imported: {
      groceryItems: importedGroceryItems,
      kitchenChoreItems: importedKitchenChoreItems,
      kitchenNotes: kitchenNotes !== undefined,
    },
  });
}
