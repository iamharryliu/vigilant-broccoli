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


todoRouter.put('/updateTodo/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todos[todoIndex].title = title;
  res.json(todos[todoIndex]);
});

todoRouter.delete('/deleteTodo/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1);
  res.json(deletedTodo[0]);
});