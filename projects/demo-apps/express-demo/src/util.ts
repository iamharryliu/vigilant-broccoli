import { v4 as uuidv4 } from 'uuid';
import { PLACEHOLDER_URL } from './const';
import axios from 'axios';

export const generateId = () => {
  return uuidv4();
};

export const fetchInitialTodos = async () => {
  try {
    const response = await axios.get(PLACEHOLDER_URL.TODO_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching initial todos:', error);
    return [];
  }
};