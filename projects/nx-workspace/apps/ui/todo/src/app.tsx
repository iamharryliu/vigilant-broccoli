import { useState, useEffect } from 'react';
import { useTranslation } from './i18n';
import { useDocumentTitle } from '@vigilant-broccoli/react-lib';

// Define types
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'todos-app-todos';

export const App = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('TODO_APP.PAGE_TITLE'));

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        console.error('Failed to parse todos from localStorage', e);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodoText.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Todo App</h1>

        {/* Add todo form */}
        <div className="mb-6 flex">
          <input
            type="text"
            value={newTodoText}
            onChange={e => setNewTodoText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder={t('TODO_APP.ADD_TODO_PLACEHOLDER')}
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
          <button
            onClick={addTodo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors"
          >
            Add
          </button>
        </div>

        {/* Todo list */}
        <ul className="mb-4">
          {filteredTodos.length === 0 ? (
            <li className="text-center py-4 text-gray-500 dark:text-gray-400">
              {filter === 'completed'
                ? t('TODO_APP.NO_COMPLETED_ITEMS')
                : filter === 'active'
                  ? t('TODO_APP.NO_ACTIVE_ITEMS')
                  : t('TODO_APP.NO_ITEMS')}
            </li>
          ) : (
            filteredTodos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mr-3 h-5 w-5 text-blue-500 rounded focus:ring-blue-400"
                  />
                  <span className={todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Todo stats and filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="mb-2 sm:mb-0">
            {t('TODO_APP.ITEMS_LEFT', { count: activeCount, plural: activeCount === 1 ? '' : 's' })}
          </div>

          <div className="flex space-x-2 mb-2 sm:mb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {t('TODO_APP.ALL_FILTER')}
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {t('TODO_APP.ACTIVE_FILTER')}
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {t('TODO_APP.COMPLETED_FILTER')}
            </button>
          </div>

          <button
            onClick={clearCompleted}
            className="hover:text-red-500 transition-colors"
          >
            {t('TODO_APP.CLEAR_COMPLETED')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
