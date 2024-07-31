import TodoForm from './TodoForm';
import TodoList from './TodoList';
import { TodoProvider } from './state/TodoContext';

export default function TodoPage() {
  return (
    <TodoProvider>
      <main className="container">
        <h1>Todo</h1>
        <TodoForm />
        <TodoList />
      </main>
    </TodoProvider>
  );
}
