import React from 'react';
import { useTodos } from './TodoContext';

export default function TodoList() {
  const { todos, deleteTodo } = useTodos();
  const handleButtonClick = (id: number) => {
    deleteTodo(id);
  };
  return (
    <ul className="list-group">
      {todos.map(todo => (
        <li className="list-group-item" key={todo.id}>
          {todo.title}
          <button
            onClick={() => handleButtonClick(todo.id)}
            className="btn btn-danger float-end"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
