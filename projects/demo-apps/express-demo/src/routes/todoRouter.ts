import express from 'express';
import { fetchInitialTodos, generateId } from '../util';
import { HTTP_STATUS_CODES } from '../const';

let todos=[];
fetchInitialTodos().then((data) => {
  todos = data;
});

export const todoRouter = express.Router();

todoRouter.get('/getTodos', (_, res) => {
    res.json(todos);
});

todoRouter.post('/addTodo', (req, res) => {
  const { title } = req.body;
  const newTodo = { id: generateId(), title };
  todos.push(newTodo);
  res.status(HTTP_STATUS_CODES.CREATED).json(newTodo);
});
