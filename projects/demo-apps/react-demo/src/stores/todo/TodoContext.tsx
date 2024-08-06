import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import useFetch from '../../hooks/useFetch';
import { TODO_ENDPOINT } from '../../config';
import { Todo, TodoContextType } from '../../types';
import { todoReducer, TODO_ACTION } from './TodoReducer';

const INITIAL_STATE: Todo[] = [];

export const TodoContext = createContext<TodoContextType>({
  todos: INITIAL_STATE,
  addTodo: () => {
    throw new Error('addTodo function not initialized');
  },
  updateTodo: () => {
    throw new Error('updateTodo function not initialized');
  },
  deleteTodo: () => {
    throw new Error('deleteTodo function not initialized');
  },
});

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todos, dispatch] = useReducer(todoReducer, INITIAL_STATE);
  const data = useFetch(TODO_ENDPOINT.GET_TODOS);

  useEffect(() => {
    if (data) {
      dispatch({ type: TODO_ACTION.SET_TODOS, payload: data });
    }
  }, [data]);

  const addTodo = useCallback(async (title: string) => {
    fetch(TODO_ENDPOINT.CREATE_TODO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    dispatch({ type: TODO_ACTION.ADD_TODO, payload: title });
  }, []);

  const updateTodo = useCallback((id: number, title: string) => {
    fetch(`${TODO_ENDPOINT.UPDATE_TODO}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    dispatch({ type: TODO_ACTION.UPDATE_TODO, payload: { id, title } });
  }, []);

  const deleteTodo = useCallback((id: number) => {
    fetch(`${TODO_ENDPOINT.DELETE_TODO}/${id}`, {
      method: 'DELETE',
    });
    dispatch({ type: TODO_ACTION.DELETE_TODO, payload: id });
  }, []);

  return (
    <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
};
