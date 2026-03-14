'use client';

import {
  Card,
  Flex,
  Text,
  Button,
  Select,
  IconButton,
  TextField,
  Tabs,
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
  useDroppable,
  Active,
  Over,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  LANE_DROP_ZONE: 'lane-drop-zone',
} as const;

const DROP_ZONE_HEIGHT = {
  DEFAULT: 'h-1',
  ACTIVE: 'h-4',
} as const;

const LANE_OPACITY = {
  DRAGGING: 0.5,
  DEFAULT: 1,
} as const;

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
  };
};

interface SortableLaneProps {
  lane: Lane;
  taskList: TaskList | undefined;
  boardId: string;
  onRemove: (boardId: string, laneId: string) => void;
  refreshTrigger: number;
}

interface LaneDropZoneProps {
  position: number;
  boardId: string;
}

const LaneDropZone = ({ position, boardId }: LaneDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-zone-${boardId}-${position}`,
    data: { type: DRAG_TYPE.LANE_DROP_ZONE, position, boardId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all ${
        isOver
          ? `${DROP_ZONE_HEIGHT.ACTIVE} bg-blue-500 rounded mx-2 my-1`
          : DROP_ZONE_HEIGHT.DEFAULT
      }`}
    />
  );
};

const SortableLane = ({
  lane,
  taskList,
  boardId,
  onRemove,
  refreshTrigger,
}: SortableLaneProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 w-80 flex-shrink-0"
    >
      <Flex justify="between" align="center" className="px-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex-1"
        >
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
      <GoogleTasksComponent
        taskListId={lane.taskListId}
        showSelector={false}
        enableDragDrop={true}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export const SwimlanesComponent = () => {
  const { data: session, status } = useSession();
  const {
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
  } = useBoards();
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('');
  const [activeTask, setActiveTask] = useState<any>(null);
  const [activeLane, setActiveLane] = useState<Lane | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardName, setEditingBoardName] = useState('');

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
    }
  }, [selectedTaskListId, activeBoardId, addLane]);

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const dragType = active.data.current?.type;

    if (dragType === DRAG_TYPE.TASK) {
      setActiveTask(active.data.current);
    } else if (dragType === DRAG_TYPE.LANE) {
      setActiveLane(active.data.current?.lane);
    }
  }, []);

  const handleLaneDragEnd = useCallback(
    (active: Active, over: Over | null) => {
      setActiveLane(null);
      if (!over || !activeBoard) return;

      const overType = over.data.current?.type;
      if (overType !== DRAG_TYPE.LANE_DROP_ZONE) return;

      const dropPosition = over.data.current?.position;
      if (dropPosition === undefined) return;

      const oldIndex = activeBoard.lanes.findIndex(
        lane => lane.id === active.id,
      );
      if (oldIndex === -1) return;

      const newLanes = [...activeBoard.lanes];
      const [movedLane] = newLanes.splice(oldIndex, 1);

      let insertIndex = dropPosition;
      if (oldIndex < dropPosition) {
        insertIndex = dropPosition - 1;
      }

      newLanes.splice(insertIndex, 0, movedLane);
      reorderLanes(activeBoard.id, newLanes);
    },
    [activeBoard, reorderLanes],
  );

  const handleTaskDragEnd = useCallback(
    async (active: Active, over: Over | null) => {
      setActiveTask(null);

      if (!over || active.id === over.id) return;

      const overType = over.data.current?.type;
      if (overType !== 'task') return;

      const taskData = active.data.current;
      const sourceListId = taskData?.taskListId;
      const targetListId = over.id as string;

      if (!sourceListId || !targetListId || sourceListId === targetListId)
        return;

      await fetch(
        `${API_ENDPOINTS.TASKS}?taskListId=${sourceListId}&taskId=${taskData.task.id}`,
        { method: 'DELETE' },
      );

      await fetch(API_ENDPOINTS.TASKS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskListId: targetListId,
          title: taskData.task.title,
          notes: taskData.task.notes,
        }),
      });

      setRefreshTrigger(prev => prev + 1);
    },
    [],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      const dragType = active.data.current?.type;

      if (dragType === DRAG_TYPE.LANE) {
        handleLaneDragEnd(active, over);
      } else if (dragType === DRAG_TYPE.TASK) {
        await handleTaskDragEnd(active, over);
      }
    },
    [handleLaneDragEnd, handleTaskDragEnd],
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
      onDragEnd={handleDragEnd}
    >
      <Flex direction="column" gap="4" className="w-full h-full p-4">
        <Flex justify="between" align="center">
          <Text size="5" weight="bold">
            Task Swimlanes
          </Text>
          {!showNewBoardForm ? (
            <Button
              onClick={() => setShowNewBoardForm(true)}
              size="2"
              variant="soft"
            >
              + New Board
            </Button>
          ) : (
            <Flex gap="2" align="center">
              <TextField.Root
                placeholder="Board name..."
                value={newBoardName}
                onChange={e => setNewBoardName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddBoard();
                  else if (e.key === 'Escape') {
                    setShowNewBoardForm(false);
                    setNewBoardName('');
                  }
                }}
                size="2"
                autoFocus
              />
              <Button onClick={handleAddBoard} size="2">
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowNewBoardForm(false);
                  setNewBoardName('');
                }}
                size="2"
                variant="soft"
              >
                Cancel
              </Button>
            </Flex>
          )}
        </Flex>

        <Tabs.Root value={activeBoardId} onValueChange={setActiveBoardId}>
          <Flex gap="2" align="center" className="flex-wrap">
            <Tabs.List>
              {boards.map(board => (
                <div
                  key={board.id}
                  className="relative inline-flex items-center"
                >
                  <Tabs.Trigger value={board.id}>
                    {editingBoardId === board.id ? (
                      <TextField.Root
                        value={editingBoardName}
                        onChange={e => setEditingBoardName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEditBoard();
                          else if (e.key === 'Escape') {
                            setEditingBoardId(null);
                            setEditingBoardName('');
                          }
                          e.stopPropagation();
                        }}
                        onBlur={handleSaveEditBoard}
                        onClick={e => e.stopPropagation()}
                        size="1"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() =>
                          handleStartEditBoard(board.id, board.name)
                        }
                      >
                        {board.name}
                      </span>
                    )}
                  </Tabs.Trigger>
                  {boards.length > 1 && (
                    <button
                      className="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      onClick={e => {
                        e.stopPropagation();
                        removeBoard(board.id);
                      }}
                      aria-label="Remove board"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </Tabs.List>
          </Flex>

          {boards.map(board => (
            <Tabs.Content key={board.id} value={board.id}>
              <Flex direction="column" gap="4">
                <Flex gap="2" align="center">
                  <Select.Root
                    value={selectedTaskListId}
                    onValueChange={setSelectedTaskListId}
                    disabled={availableTaskLists.length === 0}
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
                    onClick={handleAddLane}
                    disabled={
                      !selectedTaskListId || availableTaskLists.length === 0
                    }
                  >
                    + Add Lane
                  </Button>
                </Flex>

                {board.lanes.length === 0 ? (
                  <Card>
                    <Flex direction="column" gap="2" p="4" align="center">
                      <Text size="2" color="gray">
                        No lanes added yet. Add a lane to get started.
                      </Text>
                    </Flex>
                  </Card>
                ) : (
                  <SortableContext items={board.lanes.map(l => l.id)}>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      <LaneDropZone position={0} boardId={board.id} />
                      {board.lanes.map((lane, index) => {
                        const taskList = taskLists.find(
                          list => list.id === lane.taskListId,
                        );
                        return (
                          <div key={lane.id} className="flex gap-4">
                            <SortableLane
                              lane={lane}
                              taskList={taskList}
                              boardId={board.id}
                              onRemove={removeLane}
                              refreshTrigger={refreshTrigger}
                            />
                            <LaneDropZone
                              position={index + 1}
                              boardId={board.id}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </SortableContext>
                )}
              </Flex>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Flex>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-lg border border-gray-300 dark:border-gray-600 opacity-90">
            <Text size="2">{activeTask.task.title}</Text>
          </div>
        ) : activeLane ? (
          <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-lg border border-gray-300 dark:border-gray-600 opacity-90 w-80">
            <Text size="3" weight="bold">
              {taskLists.find(list => list.id === activeLane.taskListId)
                ?.title || 'Unknown List'}
            </Text>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
