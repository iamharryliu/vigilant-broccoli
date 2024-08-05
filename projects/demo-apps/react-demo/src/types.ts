export type Todo = {
  id: number;
  title: string;
};

export type TodoContextType = {
  todos: Todo[];
  addTodo: (title: string) => void;
  updateTodo: (id: number, title: string) => void;
  deleteTodo: (id: number) => void;
};
