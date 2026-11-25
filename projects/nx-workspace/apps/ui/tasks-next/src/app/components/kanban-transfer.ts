import type {
  Board,
  KanbanState,
  SortMode,
} from '@vigilant-broccoli/react-lib-tasks';
import type { TaskList } from '../hooks/use-task-lists';

// List ids differ between stores and change on import, so a transferred board
// refers to its lists by title.
export type TransferredKanban = {
  boards: { name: string; lanes: { taskListTitle: string }[] }[];
  sortModes: Record<string, SortMode>;
};

const titleOf = (taskLists: TaskList[], id: string) =>
  taskLists.find(list => list.id === id)?.title;

// Keeps only lanes and sort modes for the exported lists, so the file is
// self-contained.
export const toTransferredKanban = (
  state: KanbanState,
  exportedLists: TaskList[],
): TransferredKanban => {
  const exportedTitles = new Set(exportedLists.map(list => list.title));
  return {
    boards: state.boards.map(board => ({
      name: board.name,
      lanes: board.lanes.flatMap(lane => {
        const taskListTitle = titleOf(exportedLists, lane.taskListId);
        return taskListTitle ? [{ taskListTitle }] : [];
      }),
    })),
    sortModes: Object.fromEntries(
      Object.entries(state.sortModes).flatMap(([id, mode]) => {
        const title = titleOf(exportedLists, id);
        return title && exportedTitles.has(title) ? [[title, mode]] : [];
      }),
    ),
  };
};

// Appends the transferred boards to the store's own and maps lane titles back
// to this store's list ids; a lane whose list is missing is dropped.
export const mergeTransferredKanban = (
  existing: KanbanState | null,
  transferred: TransferredKanban,
  taskLists: TaskList[],
): KanbanState => {
  const idOf = (title: string) =>
    taskLists.find(list => list.title === title)?.id;
  const added: Board[] = transferred.boards.map(board => ({
    id: crypto.randomUUID(),
    name: board.name,
    lanes: board.lanes.flatMap(({ taskListTitle }) => {
      const taskListId = idOf(taskListTitle);
      return taskListId ? [{ id: crypto.randomUUID(), taskListId }] : [];
    }),
  }));
  const boards = [...(existing?.boards ?? []), ...added];
  const sortModes = { ...existing?.sortModes };
  Object.entries(transferred.sortModes).forEach(([title, mode]) => {
    const taskListId = idOf(title);
    if (taskListId) sortModes[taskListId] = mode;
  });
  return {
    boards,
    activeBoardId: existing?.activeBoardId || boards[0]?.id || '',
    sortModes,
  };
};
