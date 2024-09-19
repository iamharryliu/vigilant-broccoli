import { useEffect, useRef, useState } from 'react';

const UseRefDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const useRefCount = useRef(0);
  const inputElement = useRef<HTMLInputElement>(null);
  const previousInputValue = useRef('');

  // Focus on input element on load.
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

  useEffect(() => {
    useRefCount.current = useRefCount.current + 1;
  }, [inputValue]);

  useEffect(() => {
    previousInputValue.current = inputValue;
  }, [inputValue]);

  return (
    <>
      <h3>useRef</h3>
      <label>useRef Input Element: </label>
      <input
        type="text"
        value={inputValue}
        ref={inputElement}
        onChange={e => setInputValue(e.target.value)}
      />
      <p>Render Count: {useRefCount.current}</p>
      <p>Used for tracking state changes.</p>
      <p>Current Value: {inputValue}</p>
      <p>Previous Value: {previousInputValue.current}</p>
    </>
  );
};

export default UseRefDemo;
