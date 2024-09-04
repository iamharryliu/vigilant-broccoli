import { Todo } from '@prettydamntired/todo-lib';

export type TodoContextType = {
  todos: Todo[];
  createTodo: (title: string) => void;
  updateTodo: (id: number, title: string) => void;
  deleteTodo: (id: number) => void;
};
