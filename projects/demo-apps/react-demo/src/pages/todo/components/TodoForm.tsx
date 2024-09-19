import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useTodos } from '../../../hooks/useTodo';

export default function TodoForm() {
  const { createTodo } = useTodos();
  const [inputValue, setInputValue] = useState('');
  const inputElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputElement.current) {
      focusInput();
    }
  }, []);

  const focusInput = () => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      createTodo(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group mb-3">
        <span className="input-group-text" onClick={focusInput}>
          Todo
        </span>
        <input
          type="text"
          ref={inputElement}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="form-control"
          placeholder="Add new todo"
        />
        <button className="btn btn-outline-secondary" type="submit">
          Button
        </button>
      </div>
    </form>
  );
}
