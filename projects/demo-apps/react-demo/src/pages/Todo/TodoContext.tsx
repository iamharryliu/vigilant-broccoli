import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import useFetch from '../../custom-hooks/useFetch';

export type Todo = {
  id: number;
  title: string;
};

const REDUCER_ACTION = {
  SET_TODOS: 'SET_TODOS',
  ADD_TODO: 'ADD_TODO',
  UPDATE_TODO: 'UPDATE_TODO',
  DELETE_TODO: 'DELETE_TODO',
} as const;

export type ReducerAction =
  (typeof REDUCER_ACTION)[keyof typeof REDUCER_ACTION];

type TodosAction =
  | { type: typeof REDUCER_ACTION.SET_TODOS; payload: Todo[] }
  | { type: typeof REDUCER_ACTION.ADD_TODO; payload: string }
  | {
      type: typeof REDUCER_ACTION.UPDATE_TODO;
      payload: { id: number; title: string };
    }
  | { type: typeof REDUCER_ACTION.DELETE_TODO; payload: number };

type TodosContextType = {
  todos: Todo[];
  addTodo: (title: string) => void;
  updateTodo: (id: number, title: string) => void;
  deleteTodo: (id: number) => void;
};

const INITIAL_STATE: Todo[] = [];
const TodosContext = createContext<TodosContextType>({
  todos: INITIAL_STATE,
  addTodo: () => {},
  updateTodo: () => {},
  deleteTodo: () => {},
});

export const useTodos = () => useContext(TodosContext);

const todosReducer = (state: Todo[], action: TodosAction): Todo[] => {
  switch (action.type) {
    case REDUCER_ACTION.SET_TODOS:
      return action.payload;
    case REDUCER_ACTION.ADD_TODO:
      return [...state, { id: Date.now(), title: action.payload }];
    case REDUCER_ACTION.UPDATE_TODO:
      return state.map(todo =>
        todo.id === action.payload.id
          ? { ...todo, title: action.payload.title }
          : todo,
      );
    case REDUCER_ACTION.DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
};

export const TodosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todos, dispatch] = useReducer(todosReducer, INITIAL_STATE);
  const data = useFetch('https://jsonplaceholder.typicode.com/todos');

  useEffect(() => {
    if (data) {
      dispatch({ type: 'SET_TODOS', payload: data });
    }
  }, [data]);

  const addTodo = useCallback((title: string) => {
    dispatch({ type: 'ADD_TODO', payload: title });
  }, []);

  const updateTodo = useCallback((id: number, title: string) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, title } });
  }, []);

  const deleteTodo = useCallback((id: number) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  }, []);

  return (
    <TodosContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo }}>
      {children}
    </TodosContext.Provider>
  );
};
