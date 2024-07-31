import React, { useState } from 'react';
import { useTodos } from './state/TodoContext';

export default function TodoList() {
  const { todos, updateTodo, deleteTodo } = useTodos();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleEditClick = (id: number, currentValue: string) => {
    setEditingId(id);
    setEditingValue(currentValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const handleTodoUpdate = () => {
    if (editingId !== null) {
      if (!editingValue) {
        deleteTodo(editingId);
        return;
      }
      updateTodo(editingId, editingValue);
      setEditingId(null);
      setEditingValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTodoUpdate();
    }
  };

  const handleDeleteClick = (id: number) => {
    deleteTodo(id);
  };

  return (
    <ul className="list-group">
      {todos.map(todo => (
        <li className="list-group-item" key={todo.id}>
          {editingId === todo.id ? (
            <input
              type="text"
              value={editingValue}
              onChange={handleInputChange}
              onBlur={handleTodoUpdate}
              onKeyDown={handleInputKeyDown}
              autoFocus
            />
          ) : (
            <span onClick={() => handleEditClick(todo.id, todo.title)}>
              {todo.title}
            </span>
          )}

          <div className="float-end">
            <button
              onClick={() => handleEditClick(todo.id, todo.title)}
              className="btn btn-primary me-2"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(todo.id)}
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
