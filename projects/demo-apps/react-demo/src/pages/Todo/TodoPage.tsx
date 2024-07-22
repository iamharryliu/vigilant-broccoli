import TodoForm from './TodoForm';
import TodoList from './TodoList';
import { TodosProvider } from './TodoContext';

export default function TodoPage() {
  return (
    <TodosProvider>
      <main className="container">
        <h1>Todo</h1>
        <TodoForm />
        <TodoList />
      </main>
    </TodosProvider>
  );
}
