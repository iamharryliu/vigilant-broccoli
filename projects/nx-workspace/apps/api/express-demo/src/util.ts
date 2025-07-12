import { Todo } from '@prettydamntired/todo-lib';
import { TODO_API_URL, TODO_HEADERS } from './const';
import axios from 'axios';

export const handleApiCall = async (
  apiCall: () => Promise<any>,
  errorMessage: string,
) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error(errorMessage);
    return [];
  }
};
export const createTodo = async (todo: Todo) => {
  return await handleApiCall(
    () => axios.post(TODO_API_URL, todo, TODO_HEADERS).then(res => res.data),
    'Error creating a todo.',
  );
};

export const getTodos = async () => {
  return await handleApiCall(
    () => axios.get(TODO_API_URL).then(res => res.data),
    'Error fetching todos.',
  );
};

export const updateTodo = async (updatedTodo: Todo) => {
  return await handleApiCall(
    () =>
      axios
        .put(`${TODO_API_URL}/${updatedTodo.id}`, updatedTodo, TODO_HEADERS)
        .then(res => res.data),
    'Error updating the todo.',
  );
};

export const deleteTodo = async (id: string) => {
  return await handleApiCall(
    () => axios.delete(`${TODO_API_URL}/${id}`).then(res => res.data),
    'Error deleting the todo.',
  );
};
