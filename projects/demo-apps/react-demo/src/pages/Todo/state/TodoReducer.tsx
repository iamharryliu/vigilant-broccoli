import { Todo } from './TodoContext';

export const TODO_ACTION = {
  SET_TODOS: 'SET_TODOS',
  ADD_TODO: 'ADD_TODO',
  UPDATE_TODO: 'UPDATE_TODO',
  DELETE_TODO: 'DELETE_TODO',
} as const;

type TodoAction =
  | { type: typeof TODO_ACTION.SET_TODOS; payload: Todo[] }
  | { type: typeof TODO_ACTION.ADD_TODO; payload: string }
  | {
      type: typeof TODO_ACTION.UPDATE_TODO;
      payload: { id: number; title: string };
    }
  | { type: typeof TODO_ACTION.DELETE_TODO; payload: number };

export const todoReducer = (state: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case TODO_ACTION.SET_TODOS:
      return action.payload;
    case TODO_ACTION.ADD_TODO:
      return [...state, { id: Date.now(), title: action.payload }];
    case TODO_ACTION.UPDATE_TODO:
      return state.map(todo =>
        todo.id === action.payload.id
          ? { ...todo, title: action.payload.title }
          : todo,
      );
    case TODO_ACTION.DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
};
