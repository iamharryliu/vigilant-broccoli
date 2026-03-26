'use client';

import {
  Card,
  Flex,
  Text,
  Button,
  Select,
  IconButton,
  TextField,
  Dialog,
} from '@radix-ui/themes';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  Active,
  Over,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { GoogleTasksComponent } from './google-tasks.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface TaskList {
  id: string;
  title: string;
}

interface Lane {
  id: string;
  taskListId: string;
}

interface Board {
  id: string;
  name: string;
  lanes: Lane[];
}

const STORAGE_KEY_BOARDS = 'swimlanes-boards';
const STORAGE_KEY_ACTIVE_BOARD = 'swimlanes-active-board';

const DRAG_TYPE = {
  TASK: 'task',
  LANE: 'lane',
  BOARD: 'board',
} as const;

const LANE_OPACITY = {
  DRAGGING: 0.5,
  DEFAULT: 1,
} as const;

const OVERLAY_CLASSES = {
  BASE: 'rounded shadow-xl border',
  LIGHT: 'bg-white border-gray-200',
  DARK: 'dark:bg-gray-800 dark:border-gray-600',
} as const;

const QUADRANT_OVERLAY_COLORS: Record<string, string> = {
  Q1: 'border-l-4 border-l-red-500',
  Q2: 'border-l-4 border-l-blue-500',
  Q3: 'border-l-4 border-l-yellow-500',
  Q4: 'border-l-4 border-l-green-500',
} as const;

const getQuadrantFromTitle = (title: string): string | null => {
  const match = title.match(/^(Q[1-4])[\s:]/i);
  return match ? match[1].toUpperCase() : null;
};

const getCommitTypeFromTitle = (title: string): string | null => {
  const withoutQuadrant = title.replace(/^Q[1-4][\s:]+/i, '');
  const match = withoutQuadrant.match(/^([a-z&]+)[(:]/i);
  return match ? match[1].toLowerCase() : null;
};

const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedBoards = localStorage.getItem(STORAGE_KEY_BOARDS);
    const storedActiveBoard = localStorage.getItem(STORAGE_KEY_ACTIVE_BOARD);

    if (storedBoards) {
      const parsedBoards = JSON.parse(storedBoards);
      setBoards(parsedBoards);
      if (parsedBoards.length > 0) {
        setActiveBoardId(storedActiveBoard || parsedBoards[0].id);
      }
    } else {
      const defaultBoard: Board = {
        id: crypto.randomUUID(),
        name: 'Default Board',
        lanes: [],
      };
      setBoards([defaultBoard]);
      setActiveBoardId(defaultBoard.id);
    }
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem(STORAGE_KEY_BOARDS, JSON.stringify(boards));
    }
  }, [boards]);

  useEffect(() => {
    if (activeBoardId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_BOARD, activeBoardId);
    }
  }, [activeBoardId]);

  const addBoard = useCallback((name: string) => {
    const newBoard: Board = {
      id: crypto.randomUUID(),
      name,
      lanes: [],
    };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  }, []);

  const removeBoard = useCallback(
    (boardId: string) => {
      setBoards(prev => {
        const filtered = prev.filter(board => board.id !== boardId);
        if (activeBoardId === boardId && filtered.length > 0) {
          setActiveBoardId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeBoardId],
  );

  const renameBoard = useCallback((boardId: string, newName: string) => {
    setBoards(prev =>
      prev.map(board =>
        board.id === boardId ? { ...board, name: newName } : board,
      ),
    );
  }, []);

  const addLane = useCallback((boardId: string, taskListId: string) => {
    const newLane: Lane = {
      id: crypto.randomUUID(),
      taskListId,
    };
    setBoards(prev =>
      prev.map(board =>
        board.id === boardId
          ? { ...board, lanes: [...board.lanes, newLane] }
          : board,
      ),
    );
  }, []);

  const removeLane = useCallback((boardId: string, laneId: string) => {
    setBoards(prev =>
      prev.map(board =>
        board.id === boardId
          ? { ...board, lanes: board.lanes.filter(lane => lane.id !== laneId) }
          : board,
      ),
    );
  }, []);

  const reorderLanes = useCallback((boardId: string, newLanes: Lane[]) => {
    setBoards(prev =>
      prev.map(board =>
        board.id === boardId ? { ...board, lanes: newLanes } : board,
      ),
    );
  }, []);

  const reorderBoards = useCallback((newBoards: Board[]) => {
    setBoards(newBoards);
  }, []);

  const activeBoard = boards.find(board => board.id === activeBoardId);

  return {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    taskLists,
    setTaskLists,
    loading,
    setLoading,
    addBoard,
    removeBoard,
    renameBoard,
    addLane,
    removeLane,
    reorderLanes,
    reorderBoards,
  };
};

interface SortableBoardProps {
  board: Board;
  isActive: boolean;
  onSelect: (boardId: string) => void;
  onRemove: (boardId: string) => void;
  editingBoardId: string | null;
  editingBoardName: string;
  onStartEdit: (boardId: string, name: string) => void;
  onSaveEdit: () => void;
  onEditNameChange: (name: string) => void;
  onCancelEdit: () => void;
  showDeleteButton: boolean;
}

interface DragOverTask {
  id: string;
  title: string;
}

interface SortableLaneProps {
  lane: Lane;
  taskList: TaskList | undefined;
  boardId: string;
  onRemove: (boardId: string, laneId: string) => void;
  refreshTrigger: number;
  isTaskDragOver: boolean;
  isDraggingTask: boolean;
  isDraggingLane: boolean;
  dragOverTask: DragOverTask | null;
}

const SortableBoard = ({
  board,
  isActive,
  onSelect,
  onRemove,
  editingBoardId,
  editingBoardName,
  onStartEdit,
  onSaveEdit,
  onEditNameChange,
  onCancelEdit,
  showDeleteButton,
}: SortableBoardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: board.id,
    data: { type: DRAG_TYPE.BOARD, board },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? LANE_OPACITY.DRAGGING : LANE_OPACITY.DEFAULT,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Flex
        justify="between"
        align="center"
        className={`py-1 px-2 rounded ${
          isActive ? 'border-l-2 border-blue-500' : ''
        }`}
      >
        {editingBoardId === board.id ? (
          <TextField.Root
            value={editingBoardName}
            onChange={e => onEditNameChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onSaveEdit();
              else if (e.key === 'Escape') onCancelEdit();
            }}
            onBlur={onSaveEdit}
            size="1"
            className="flex-1"
            autoFocus
          />
        ) : (
          <div
            {...attributes}
            {...listeners}
            onClick={() => onSelect(board.id)}
            onDoubleClick={() => onStartEdit(board.id, board.name)}
            className="flex-1 cursor-grab active:cursor-grabbing"
          >
            <Text size="2" weight={isActive ? 'bold' : 'regular'}>
              {board.name}
            </Text>
          </div>
        )}
        {showDeleteButton && (
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            onClick={e => {
              e.stopPropagation();
              onRemove(board.id);
            }}
          >
            ✕
          </IconButton>
        )}
      </Flex>
    </div>
  );
};

const SortableLane = ({
  lane,
  taskList,
  boardId,
  onRemove,
  refreshTrigger,
  isTaskDragOver,
  isDraggingTask,
  isDraggingLane,
  dragOverTask,
}: SortableLaneProps) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lane.id,
    data: { type: DRAG_TYPE.LANE, lane },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? LANE_OPACITY.DRAGGING : LANE_OPACITY.DEFAULT,
  };

  if (isDragging) {
    return (
      <div
        ref={setSortableRef}
        style={style}
        className="w-80 h-64 flex-shrink-0 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-950 opacity-50"
      />
    );
  }

  const laneHighlight = isTaskDragOver
    ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-950'
    : isDraggingTask
    ? 'ring-1 ring-dashed ring-gray-300 dark:ring-gray-600'
    : '';

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`flex flex-col gap-2 w-80 flex-shrink-0 rounded-lg transition-all duration-150 h-full overflow-hidden ${laneHighlight}`}
    >
      <Flex justify="between" align="center" className="px-2 flex-shrink-0">
        <div
          {...attributes}
          {...listeners}
          className={`flex items-center gap-1 flex-1 ${
            isDraggingLane
              ? 'cursor-grabbing'
              : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <DragHandleDots2Icon className="opacity-40 hover:opacity-70 flex-shrink-0" />
          <Text size="3" weight="bold">
            {taskList?.title || 'Unknown List'}
          </Text>
        </div>
        <IconButton
          size="1"
          variant="soft"
          color="red"
          onClick={() => onRemove(boardId, lane.id)}
        >
          ✕
        </IconButton>
      </Flex>
      <div className="flex-1 overflow-y-auto min-h-0">
        <GoogleTasksComponent
          taskListId={lane.taskListId}
          showSelector={false}
          enableDragDrop={true}
          refreshTrigger={refreshTrigger}
          disableInternalDndContext={true}
          dragOverTask={dragOverTask}
        />
      </div>
    </div>
  );
};

const TaskDragOverlay = ({
  task,
}: {
  task: { title: string; notes?: string; due?: string };
}) => {
  const quadrant = getQuadrantFromTitle(task.title);
  const commitType = getCommitTypeFromTitle(task.title);
  const quadrantClass = quadrant ? QUADRANT_OVERLAY_COLORS[quadrant] : '';

  return (
    <div
      className={`${OVERLAY_CLASSES.BASE} ${OVERLAY_CLASSES.LIGHT} ${OVERLAY_CLASSES.DARK} p-3 max-w-72 rotate-2 ${quadrantClass}`}
    >
      <Flex direction="column" gap="1">
        <Flex align="center" gap="2">
          <DragHandleDots2Icon className="opacity-60 flex-shrink-0" />
          <Text size="2" weight="medium" className="line-clamp-2">
            {task.title}
          </Text>
        </Flex>
        {task.notes && (
          <Text size="1" color="gray" className="ml-5 line-clamp-1">
            {task.notes}
          </Text>
        )}
        <Flex gap="2" align="center" className="ml-5">
          {task.due && (
            <Text size="1" color="blue">
              {new Date(task.due).toLocaleDateString()}
            </Text>
          )}
          {commitType && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {commitType}
            </span>
          )}
        </Flex>
      </Flex>
    </div>
  );
};

const LaneDragOverlay = ({ title }: { title: string }) => (
  <div
    className={`${OVERLAY_CLASSES.BASE} ${OVERLAY_CLASSES.LIGHT} ${OVERLAY_CLASSES.DARK} p-3 w-80 rotate-1`}
  >
    <Flex align="center" gap="2">
      <DragHandleDots2Icon className="opacity-60 flex-shrink-0" />
      <Text size="3" weight="bold">
        {title}
      </Text>
    </Flex>
    <div className="mt-2 space-y-1.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-6 rounded bg-gray-100 dark:bg-gray-700"
          style={{ width: `${80 - i * 15}%` }}
        />
      ))}
    </div>
  </div>
);

const BoardDragOverlay = ({ name }: { name: string }) => (
  <div
    className={`${OVERLAY_CLASSES.BASE} ${OVERLAY_CLASSES.LIGHT} ${OVERLAY_CLASSES.DARK} py-1.5 px-3 border-l-2 border-l-blue-500 rotate-1`}
  >
    <Text size="2" weight="bold">
      {name}
    </Text>
  </div>
);

// eslint-disable-next-line complexity
export const KanbanComponent = () => {
  const { status } = useSession();
  const {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    taskLists,
    setTaskLists,
    setLoading,
    addBoard,
    removeBoard,
    renameBoard,
    addLane,
    removeLane,
    reorderLanes,
    reorderBoards,
  } = useBoards();
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('');
  const [activeTask, setActiveTask] = useState<any>(null);
  const [activeLane, setActiveLane] = useState<Lane | null>(null);
  const [activeBoard_dnd, setActiveBoard_dnd] = useState<Board | null>(null);
  const [overTaskListId, setOverTaskListId] = useState<string | null>(null);
  const [draggingLanes, setDraggingLanes] = useState<Lane[] | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardName, setEditingBoardName] = useState('');
  const [showAddLaneDialog, setShowAddLaneDialog] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [showManageLists, setShowManageLists] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    const fetchTaskLists = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TASKS_LISTS);
        const data = await response.json();

        if (response.ok && data.taskLists) {
          setTaskLists(data.taskLists);
          if (data.taskLists.length > 0 && !selectedTaskListId) {
            setSelectedTaskListId(data.taskLists[0].id);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task lists:', err);
        setLoading(false);
      }
    };
    fetchTaskLists();
  }, [status]);

  const handleAddLane = useCallback(() => {
    if (selectedTaskListId && activeBoardId) {
      addLane(activeBoardId, selectedTaskListId);
      setShowAddLaneDialog(false);
      setSelectedTaskListId('');
    }
  }, [selectedTaskListId, activeBoardId, addLane]);

  const handleDeleteList = useCallback(
    async (taskListId: string) => {
      const response = await fetch(
        `${API_ENDPOINTS.TASKS_LISTS}?taskListId=${taskListId}`,
        { method: 'DELETE' },
      );
      if (!response.ok) return;
      setTaskLists(prev => prev.filter(list => list.id !== taskListId));
      boards.forEach(board => {
        const lane = board.lanes.find(l => l.taskListId === taskListId);
        if (lane) removeLane(board.id, lane.id);
      });
    },
    [boards, removeLane, setTaskLists],
  );

  const handleRenameList = useCallback(
    async (taskListId: string, title: string) => {
      const response = await fetch(
        `${API_ENDPOINTS.TASKS_LISTS}?taskListId=${taskListId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        },
      );
      if (!response.ok) return;
      setTaskLists(prev =>
        prev.map(list => (list.id === taskListId ? { ...list, title } : list)),
      );
      setEditingListId(null);
      setEditingListName('');
    },
    [setTaskLists],
  );

  const handleCreateList = useCallback(async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    const response = await fetch(API_ENDPOINTS.TASKS_LISTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newListName.trim() }),
    });
    const data = await response.json();
    if (response.ok && data.taskList) {
      setTaskLists(prev => [...prev, data.taskList]);
      setSelectedTaskListId(data.taskList.id);
      setNewListName('');
      setShowCreateList(false);
    }
    setCreatingList(false);
  }, [newListName, setTaskLists]);

  const handleAddBoard = useCallback(() => {
    if (newBoardName.trim()) {
      addBoard(newBoardName.trim());
      setNewBoardName('');
      setShowNewBoardForm(false);
    }
  }, [newBoardName, addBoard]);

  const handleStartEditBoard = useCallback(
    (boardId: string, currentName: string) => {
      setEditingBoardId(boardId);
      setEditingBoardName(currentName);
    },
    [],
  );

  const handleSaveEditBoard = useCallback(() => {
    if (editingBoardId && editingBoardName.trim()) {
      renameBoard(editingBoardId, editingBoardName.trim());
    }
    setEditingBoardId(null);
    setEditingBoardName('');
  }, [editingBoardId, editingBoardName, renameBoard]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const dragType = active.data.current?.type;

      if (dragType === DRAG_TYPE.TASK) {
        setActiveTask(active.data.current);
      } else if (dragType === DRAG_TYPE.LANE) {
        setActiveLane(active.data.current?.lane);
        setDraggingLanes(activeBoard?.lanes ?? null);
      } else if (dragType === DRAG_TYPE.BOARD) {
        setActiveBoard_dnd(active.data.current?.board);
      }
    },
    [activeBoard],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    const dragType = active.data.current?.type;

    if (dragType === DRAG_TYPE.TASK) {
      setOverTaskListId(over?.data.current?.taskListId ?? null);
      return;
    }

    if (dragType === DRAG_TYPE.LANE && over) {
      setDraggingLanes(prev => {
        if (!prev) return prev;

        const overLaneId =
          over.data.current?.type === DRAG_TYPE.LANE
            ? (over.id as string)
            : over.data.current?.taskListId
            ? prev.find(l => l.taskListId === over.data.current?.taskListId)?.id
            : undefined;

        if (!overLaneId) return prev;

        const oldIndex = prev.findIndex(l => l.id === active.id);
        const newIndex = prev.findIndex(l => l.id === overLaneId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
          return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleLaneDragEnd = useCallback(() => {
    setActiveLane(null);
    if (activeBoard && draggingLanes) {
      reorderLanes(activeBoard.id, draggingLanes);
    }
    setDraggingLanes(null);
  }, [activeBoard, draggingLanes, reorderLanes]);

  const handleTaskReorder = useCallback(
    async (taskListId: string, taskId: string, overTaskId: string) => {
      const response = await fetch(
        `${API_ENDPOINTS.TASKS}?taskListId=${taskListId}`,
      );
      const data = await response.json();
      if (!response.ok || !data.tasks) return;

      const tasks: { id: string }[] = data.tasks.filter(
        (t: { status: string }) => t.status !== 'completed',
      );
      const activeIndex = tasks.findIndex(t => t.id === taskId);
      const overIndex = tasks.findIndex(t => t.id === overTaskId);
      if (activeIndex === -1 || overIndex === -1) return;

      const reordered = [...tasks];
      const [moved] = reordered.splice(activeIndex, 1);
      reordered.splice(overIndex, 0, moved);

      const newIndex = reordered.findIndex(t => t.id === taskId);
      const previousTaskId = newIndex > 0 ? reordered[newIndex - 1].id : null;

      await fetch(API_ENDPOINTS.TASKS_MOVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskListId,
          taskId,
          previous: previousTaskId,
        }),
      });

      setRefreshTrigger(prev => prev + 1);
    },
    [],
  );

  const handleTaskCrossListMove = useCallback(
    async (taskData: any, sourceListId: string, targetListId: string) => {
      const createResponse = await fetch(API_ENDPOINTS.TASKS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskListId: targetListId,
          title: taskData.task.title,
          notes: taskData.task.notes,
        }),
      });

      if (!createResponse.ok) return;

      await fetch(
        `${API_ENDPOINTS.TASKS}?taskListId=${sourceListId}&taskId=${taskData.task.id}`,
        { method: 'DELETE' },
      );

      setRefreshTrigger(prev => prev + 1);
    },
    [],
  );

  const handleTaskDragEnd = useCallback(
    async (active: Active, over: Over | null) => {
      setActiveTask(null);
      setOverTaskListId(null);

      if (!over || active.id === over.id) return;

      const overType = over.data.current?.type;
      if (overType !== 'task' && overType !== 'taskList') return;

      const taskData = active.data.current;
      const sourceListId = taskData?.taskListId;
      const targetListId = over.data.current?.taskListId;

      if (!sourceListId || !targetListId) return;

      if (sourceListId === targetListId) {
        if (overType === 'task') {
          await handleTaskReorder(
            sourceListId,
            active.id as string,
            over.id as string,
          );
        }
        return;
      }

      await handleTaskCrossListMove(taskData, sourceListId, targetListId);
    },
    [handleTaskReorder, handleTaskCrossListMove],
  );

  const handleBoardDragEnd = useCallback(
    (active: Active, over: Over | null) => {
      setActiveBoard_dnd(null);
      if (!over || active.id === over.id) return;

      const oldIndex = boards.findIndex(board => board.id === active.id);
      const newIndex = boards.findIndex(board => board.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newBoards = arrayMove(boards, oldIndex, newIndex);
      reorderBoards(newBoards);
    },
    [boards, reorderBoards],
  );

  const resetDragState = useCallback(() => {
    setActiveTask(null);
    setActiveLane(null);
    setActiveBoard_dnd(null);
    setOverTaskListId(null);
    setDraggingLanes(null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      const dragType = active.data.current?.type;

      if (dragType === DRAG_TYPE.BOARD) {
        handleBoardDragEnd(active, over);
      } else if (dragType === DRAG_TYPE.LANE) {
        handleLaneDragEnd();
      } else if (dragType === DRAG_TYPE.TASK) {
        await handleTaskDragEnd(active, over);
      }

      resetDragState();
    },
    [handleBoardDragEnd, handleLaneDragEnd, handleTaskDragEnd, resetDragState],
  );

  const availableTaskLists = taskLists.filter(
    list => !activeBoard?.lanes.some(lane => lane.taskListId === list.id),
  );

  if (status === 'unauthenticated') {
    return (
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Text size="5" weight="bold">
            Swimlanes
          </Text>
          <Text size="2" color="gray">
            Sign in to view your Google Tasks swimlanes
          </Text>
        </Flex>
      </Card>
    );
  }

  if (!activeBoard) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDragState}
    >
      <div className="flex h-full">
        <div
          className={`transition-all duration-300 border-r flex flex-col gap-4 overflow-hidden ${
            sidebarOpen ? 'w-64 p-4 overflow-y-auto' : 'w-0 p-0 border-r-0'
          }`}
        >
          {sidebarOpen && (
            <>
              <Flex justify="between" align="center">
                <Text size="4" weight="bold">
                  Boards
                </Text>
                <Flex gap="1">
                  <Dialog.Root
                    open={showManageLists}
                    onOpenChange={open => {
                      setShowManageLists(open);
                      if (!open) {
                        setEditingListId(null);
                        setEditingListName('');
                      }
                    }}
                  >
                    <Dialog.Trigger>
                      <IconButton size="1" variant="ghost">
                        ☰
                      </IconButton>
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Title>Manage Task Lists</Dialog.Title>
                      <Flex direction="column" gap="2">
                        {taskLists.map(list => (
                          <Flex
                            key={list.id}
                            justify="between"
                            align="center"
                            className="py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            {editingListId === list.id ? (
                              <TextField.Root
                                value={editingListName}
                                onChange={e =>
                                  setEditingListName(e.target.value)
                                }
                                onKeyDown={e => {
                                  if (e.key === 'Enter')
                                    handleRenameList(list.id, editingListName);
                                  else if (e.key === 'Escape') {
                                    setEditingListId(null);
                                    setEditingListName('');
                                  }
                                }}
                                onBlur={() =>
                                  handleRenameList(list.id, editingListName)
                                }
                                size="1"
                                className="flex-1"
                                autoFocus
                              />
                            ) : (
                              <Text
                                size="2"
                                className="flex-1 cursor-pointer"
                                onDoubleClick={() => {
                                  setEditingListId(list.id);
                                  setEditingListName(list.title);
                                }}
                              >
                                {list.title}
                              </Text>
                            )}
                            <Flex gap="1">
                              {editingListId !== list.id && (
                                <IconButton
                                  size="1"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingListId(list.id);
                                    setEditingListName(list.title);
                                  }}
                                >
                                  ✎
                                </IconButton>
                              )}
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="red"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Delete "${list.title}" and all its tasks? This cannot be undone.`,
                                    )
                                  )
                                    handleDeleteList(list.id);
                                }}
                              >
                                🗑
                              </IconButton>
                            </Flex>
                          </Flex>
                        ))}
                        {taskLists.length === 0 && (
                          <Text size="2" color="gray">
                            No task lists found
                          </Text>
                        )}
                      </Flex>
                      <Flex justify="end" mt="4">
                        <Dialog.Close>
                          <Button variant="soft">Close</Button>
                        </Dialog.Close>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                  <Dialog.Root
                    open={showNewBoardForm}
                    onOpenChange={setShowNewBoardForm}
                  >
                    <Dialog.Trigger>
                      <IconButton size="1" variant="ghost">
                        +
                      </IconButton>
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Title>Add Board</Dialog.Title>
                      <Flex direction="column" gap="3">
                        <TextField.Root
                          placeholder="Board name..."
                          value={newBoardName}
                          onChange={e => setNewBoardName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddBoard();
                          }}
                          size="2"
                          autoFocus
                        />
                        <Flex gap="3" justify="end">
                          <Dialog.Close>
                            <Button variant="soft">Cancel</Button>
                          </Dialog.Close>
                          <Button
                            onClick={handleAddBoard}
                            disabled={!newBoardName.trim()}
                          >
                            Add Board
                          </Button>
                        </Flex>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </Flex>
              </Flex>

              <SortableContext items={boards.map(b => b.id)}>
                <div className="flex flex-col gap-1">
                  {boards.map(board => (
                    <SortableBoard
                      key={board.id}
                      board={board}
                      isActive={activeBoardId === board.id}
                      onSelect={setActiveBoardId}
                      onRemove={removeBoard}
                      editingBoardId={editingBoardId}
                      editingBoardName={editingBoardName}
                      onStartEdit={handleStartEditBoard}
                      onSaveEdit={handleSaveEditBoard}
                      onEditNameChange={setEditingBoardName}
                      onCancelEdit={() => {
                        setEditingBoardId(null);
                        setEditingBoardName('');
                      }}
                      showDeleteButton={boards.length > 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <Flex direction="column" gap="4" className="w-full h-full p-4">
            <Flex align="center" gap="2">
              <IconButton
                size="2"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? '←' : '→'}
              </IconButton>
              <Text size="4" weight="bold">
                {activeBoard.name}
              </Text>
            </Flex>
            <SortableContext
              items={(draggingLanes ?? activeBoard?.lanes ?? []).map(l => l.id)}
            >
              <div className="flex gap-2 overflow-x-auto pb-4 h-full">
                {(draggingLanes ?? activeBoard?.lanes ?? []).map(lane => {
                  const taskList = taskLists.find(
                    list => list.id === lane.taskListId,
                  );
                  return (
                    <SortableLane
                      key={lane.id}
                      lane={lane}
                      taskList={taskList}
                      boardId={activeBoardId}
                      onRemove={removeLane}
                      refreshTrigger={refreshTrigger}
                      isTaskDragOver={overTaskListId === lane.taskListId}
                      isDraggingTask={!!activeTask}
                      isDraggingLane={!!activeLane}
                      dragOverTask={
                        activeTask &&
                        overTaskListId === lane.taskListId &&
                        activeTask.taskListId !== lane.taskListId
                          ? {
                              id: activeTask.task.id,
                              title: activeTask.task.title,
                            }
                          : null
                      }
                    />
                  );
                })}
                <div className="ml-2">
                  <Dialog.Root
                    open={showAddLaneDialog}
                    onOpenChange={setShowAddLaneDialog}
                  >
                    <Dialog.Trigger>
                      <Button
                        variant="ghost"
                        size="2"
                        className="w-80 h-12 flex-shrink-0 border-2 border-dashed"
                      >
                        <Text size="3">+ Add Lane</Text>
                      </Button>
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Title>Add Lane</Dialog.Title>
                      <Flex direction="column" gap="3">
                        {showCreateList ? (
                          <Flex direction="column" gap="2">
                            <TextField.Root
                              placeholder="New list name..."
                              value={newListName}
                              onChange={e => setNewListName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleCreateList();
                                else if (e.key === 'Escape')
                                  setShowCreateList(false);
                              }}
                              autoFocus
                            />
                            <Flex gap="2">
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => setShowCreateList(false)}
                              >
                                Back
                              </Button>
                              <Button
                                size="1"
                                onClick={handleCreateList}
                                disabled={!newListName.trim() || creatingList}
                              >
                                {creatingList ? 'Creating...' : 'Create List'}
                              </Button>
                            </Flex>
                          </Flex>
                        ) : (
                          <>
                            <Select.Root
                              value={selectedTaskListId}
                              onValueChange={setSelectedTaskListId}
                            >
                              <Select.Trigger
                                placeholder={
                                  availableTaskLists.length === 0
                                    ? 'No task lists available'
                                    : 'Select task list...'
                                }
                              />
                              <Select.Content>
                                {availableTaskLists.map(list => (
                                  <Select.Item key={list.id} value={list.id}>
                                    {list.title}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                            <Button
                              size="1"
                              variant="ghost"
                              onClick={() => setShowCreateList(true)}
                            >
                              + Create new list
                            </Button>
                          </>
                        )}
                        <Flex gap="3" justify="end">
                          <Dialog.Close>
                            <Button variant="soft">Cancel</Button>
                          </Dialog.Close>
                          {!showCreateList && (
                            <Button
                              onClick={handleAddLane}
                              disabled={!selectedTaskListId}
                            >
                              Add Lane
                            </Button>
                          )}
                        </Flex>
                      </Flex>
                    </Dialog.Content>
                  </Dialog.Root>
                </div>
              </div>
            </SortableContext>
          </Flex>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskDragOverlay task={activeTask.task} />
        ) : activeLane ? (
          <LaneDragOverlay
            title={
              taskLists.find(list => list.id === activeLane.taskListId)
                ?.title || 'Unknown List'
            }
          />
        ) : activeBoard_dnd ? (
          <BoardDragOverlay name={activeBoard_dnd.name} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
