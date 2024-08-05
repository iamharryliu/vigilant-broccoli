import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import useFetch from '../../../custom-hooks/useFetch';
import { TODO_ACTION, todoReducer } from './TodoReducer';
import { GET_TODOS_ENDPOINT } from '../../../config';

export type Todo = {
  id: number;
  title: string;
};

type TodoContextType = {
  todos: Todo[];
  addTodo: (title: string) => void;
  updateTodo: (id: number, title: string) => void;
  deleteTodo: (id: number) => void;
};

const INITIAL_STATE: Todo[] = [];
const TodoContext = createContext<TodoContextType>({
  todos: INITIAL_STATE,
  addTodo: () => {},
  updateTodo: () => {},
  deleteTodo: () => {},
});

export const useTodos = () => useContext(TodoContext);
export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todos, dispatch] = useReducer(todoReducer, INITIAL_STATE);
  let data = useFetch(GET_TODOS_ENDPOINT);

  useEffect(() => {
    if (data) {
      dispatch({ type: TODO_ACTION.SET_TODOS, payload: data });
    }
  }, [data]);

  const addTodo = useCallback((title: string) => {
    dispatch({ type: TODO_ACTION.ADD_TODO, payload: title });
  }, []);

  const updateTodo = useCallback((id: number, title: string) => {
    dispatch({ type: TODO_ACTION.UPDATE_TODO, payload: { id, title } });
  }, []);

  const deleteTodo = useCallback((id: number) => {
    dispatch({ type: TODO_ACTION.DELETE_TODO, payload: id });
  }, []);

  return (
    <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
};
