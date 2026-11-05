import { getDb } from '../../../lib/mongo';

const COLLECTION = 'kanban_boards';

export interface Lane {
  id: string;
  taskListId: string;
}

export interface Board {
  id: string;
  name: string;
  lanes: Lane[];
}

export interface KanbanState {
  boards: Board[];
  activeBoardId: string;
  sortModes: Record<string, string>;
}

interface KanbanDoc extends KanbanState {
  userEmail: string;
  updatedAt: string;
}

const getCollection = async () =>
  (await getDb()).collection<KanbanDoc>(COLLECTION);

export const getKanbanState = async (
  userEmail: string,
): Promise<KanbanState | null> => {
  const collection = await getCollection();
  const doc = await collection.findOne({ userEmail });
  if (!doc) return null;
  return {
    boards: doc.boards,
    activeBoardId: doc.activeBoardId,
    sortModes: doc.sortModes ?? {},
  };
};

export const saveKanbanState = async (
  userEmail: string,
  state: KanbanState,
): Promise<void> => {
  const collection = await getCollection();
  await collection.updateOne(
    { userEmail },
    {
      $set: {
        boards: state.boards,
        activeBoardId: state.activeBoardId,
        sortModes: state.sortModes ?? {},
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
};
