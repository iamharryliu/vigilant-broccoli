import { JSONPlaceHolderPost } from './jsonplaceholder.types';

const JSON_PLACEHOLDER_URL = {
  POST: 'https://jsonplaceholder.typicode.com/posts',
};

async function createTodo(
  item: JSONPlaceHolderPost,
  existingItems: JSONPlaceHolderPost[],
): Promise<JSONPlaceHolderPost> {
  const response = await fetch(JSON_PLACEHOLDER_URL.POST, {
    method: 'POST',
    body: JSON.stringify(item),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
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
    method: 'PUT',
    body: JSON.stringify(item),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  });
}

async function deleteTodo(id: number): Promise<void> {
  await fetch(`${JSON_PLACEHOLDER_URL.POST}/${id}`, {
    method: 'DELETE',
  });
}

export const JSONPlaceholderPostService = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};
