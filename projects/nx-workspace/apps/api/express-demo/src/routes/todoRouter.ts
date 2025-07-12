import express from 'express';
import { getTodos, updateTodo, deleteTodo, createTodo } from '../util';

export const todoRouter = express.Router();

todoRouter.get('', async (_, res) => {
  res.json(await getTodos());
});

todoRouter.post('', async (req, res) => {
  res.json(await createTodo(req.body));
});

todoRouter.put('/:id', async (req, res) => {
  res.json(await updateTodo(req.body));
});

todoRouter.delete('/:id', async (req, res) => {
  res.json(await deleteTodo(req.params.id));
});
