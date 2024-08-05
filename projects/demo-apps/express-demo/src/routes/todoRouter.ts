import express from 'express';
import axios from 'axios';
import { PLACEHOLDER_URL } from '../configs/app.const';

let todos=[];
const fetchInitialTodos = async () => {
  try {
    const response = await axios.get(PLACEHOLDER_URL.TODO_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching initial todos:', error);
    return [];
  }
};
fetchInitialTodos().then((data) => {
  todos = data;
});

export const todoRouter = express.Router();

todoRouter.get('/getTodos', (req, res) => {
    res.json(todos);
});