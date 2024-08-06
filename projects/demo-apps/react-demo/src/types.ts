export type Todo = {
  id: number;
  title: string;
};

export type TodoContextType = {
  todos: Todo[];
  createTodo: (title: string) => void;
  updateTodo: (id: number, title: string) => void;
  deleteTodo: (id: number) => void;
};
