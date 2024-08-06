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
  createTodo: () => {
    throw new Error('createTodo function not initialized');
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

  const createTodo = useCallback(async (title: string) => {
    const response = await fetch(TODO_ENDPOINT.CREATE_TODO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    const payload = await response.json()
    dispatch({ type: TODO_ACTION.CREATE_TODO, payload});
  }, []);

  const updateTodo = useCallback(async (id: number, title: string) => {
    const response = await fetch(`${TODO_ENDPOINT.UPDATE_TODO}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    const payload = await response.json()
    dispatch({ type: TODO_ACTION.UPDATE_TODO, payload});
  }, []);

  const deleteTodo = useCallback((id: number) => {
    fetch(`${TODO_ENDPOINT.DELETE_TODO}/${id}`, {
      method: 'DELETE',
    });
    dispatch({ type: TODO_ACTION.DELETE_TODO, payload: id });
  }, []);

  return (
    <TodoContext.Provider value={{ todos, createTodo, updateTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
};
