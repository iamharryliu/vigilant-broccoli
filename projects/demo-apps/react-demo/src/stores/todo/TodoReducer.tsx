import { Todo } from '@prettydamntired/todo-lib';

export const TODO_ACTION = {
  CREATE_TODO: 'CREATE_TODO',
  SET_TODOS: 'SET_TODOS',
  UPDATE_TODO: 'UPDATE_TODO',
  DELETE_TODO: 'DELETE_TODO',
} as const;

type TodoAction =
  | { type: typeof TODO_ACTION.SET_TODOS; payload: Todo[] }
  | { type: typeof TODO_ACTION.CREATE_TODO; payload: Todo }
  | {
      type: typeof TODO_ACTION.UPDATE_TODO;
      payload: Todo;
    }
  | { type: typeof TODO_ACTION.DELETE_TODO; payload: number };

export const todoReducer = (todos: Todo[], action: TodoAction): Todo[] => {
  const { type, payload } = action;

  switch (type) {
    case TODO_ACTION.CREATE_TODO: {
      const todo = {
        ...payload,
        id:
          todos.reduce((max, todo) => {
            return todo.id > max ? todo.id : max;
          }, Number.NEGATIVE_INFINITY) + 1,
      };

      return [...todos, todo];
    }

    case TODO_ACTION.SET_TODOS:
      return payload;

    case TODO_ACTION.UPDATE_TODO:
      return todos.map(todo => (todo.id === payload.id ? payload : todo));

    case TODO_ACTION.DELETE_TODO:
      return todos.filter(todo => todo.id !== payload);

    default:
      return todos;
  }
};
