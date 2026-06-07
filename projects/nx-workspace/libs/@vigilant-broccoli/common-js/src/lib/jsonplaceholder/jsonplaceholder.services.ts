import { JSON_PLACEHOLDER_URL } from './jsonplaceholder.consts';
import { JSONPlaceHolderPost } from './jsonplaceholder.types';
import { HTTP_METHOD, HTTP_HEADERS } from '../http/http.consts';

async function createTodo(
  item: JSONPlaceHolderPost,
  existingItems: JSONPlaceHolderPost[],
): Promise<JSONPlaceHolderPost> {
  const response = await fetch(JSON_PLACEHOLDER_URL.POST, {
    method: HTTP_METHOD.POST,
    body: JSON.stringify(item),
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
  });
  const data = await response.json();

  return {
    ...data,
    id: Math.max(...existingItems.map(item => item.id)) + 1, // Fake ID assignment
  };
}

async function getTodos(limit: number): Promise<JSONPlaceHolderPost[]> {
  const response = await fetch(`${JSON_PLACEHOLDER_URL.POST}?_limit=${limit}`);
  const data = await response.json();
  return data;
}

async function updateTodo(item: JSONPlaceHolderPost): Promise<void> {
  await fetch(`${JSON_PLACEHOLDER_URL.POST}/${item.id}`, {
    method: HTTP_METHOD.PUT,
    body: JSON.stringify(item),
    headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
  });
}

async function deleteTodo(id: number): Promise<void> {
  await fetch(`${JSON_PLACEHOLDER_URL.POST}/${id}`, {
    method: HTTP_METHOD.DELETE,
  });
}

export const JSONPlaceholderPostService = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};
