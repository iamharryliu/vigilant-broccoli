export interface MockTaskList {
  id: string;
  title: string;
}

export interface MockTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: string;
  position: string;
}

let nextId = 1;
const generateId = () => `mock-${nextId++}`;

export const createMockStore = () => {
  let taskLists: MockTaskList[] = [];
  let tasks: Record<string, MockTask[]> = {};

  return {
    reset: () => {
      nextId = 1;
      taskLists = [];
      tasks = {};
    },

    getTaskLists: () => taskLists,

    createTaskList: (title: string) => {
      const list: MockTaskList = { id: generateId(), title };
      taskLists.push(list);
      tasks[list.id] = [];
      return list;
    },

    renameTaskList: (id: string, title: string) => {
      const list = taskLists.find(l => l.id === id);
      if (list) list.title = title;
      return list;
    },

    deleteTaskList: (id: string) => {
      taskLists = taskLists.filter(l => l.id !== id);
      delete tasks[id];
    },

    getTasks: (taskListId: string) =>
      (tasks[taskListId] || [])
        .filter(t => t.status !== 'completed')
        .sort((a, b) => a.position.localeCompare(b.position)),

    createTask: (
      taskListId: string,
      title: string,
      notes?: string,
      due?: string,
    ) => {
      const listTasks = tasks[taskListId] || [];
      const position = String(listTasks.length).padStart(5, '0');
      const task: MockTask = {
        id: generateId(),
        title,
        notes,
        due,
        status: 'needsAction',
        position,
      };
      listTasks.push(task);
      tasks[taskListId] = listTasks;
      return task;
    },

    updateTask: (
      taskListId: string,
      taskId: string,
      updates: Partial<MockTask>,
    ) => {
      const listTasks = tasks[taskListId] || [];
      const task = listTasks.find(t => t.id === taskId);
      if (task) Object.assign(task, updates);
      return task;
    },

    deleteTask: (taskListId: string, taskId: string) => {
      tasks[taskListId] = (tasks[taskListId] || []).filter(
        t => t.id !== taskId,
      );
    },

    moveTask: (
      taskListId: string,
      taskId: string,
      previousId: string | null,
    ) => {
      const listTasks = tasks[taskListId] || [];
      const taskIndex = listTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return null;

      const [task] = listTasks.splice(taskIndex, 1);

      if (!previousId) {
        listTasks.unshift(task);
      } else {
        const prevIndex = listTasks.findIndex(t => t.id === previousId);
        listTasks.splice(prevIndex + 1, 0, task);
      }

      listTasks.forEach((t, i) => {
        t.position = String(i).padStart(5, '0');
      });

      tasks[taskListId] = listTasks;
      return task;
    },
  };
};
