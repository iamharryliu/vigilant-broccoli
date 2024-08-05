import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { TodoProvider } from '../../stores/TodoContext';

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
