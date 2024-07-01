import React, { useEffect, useRef, useState } from 'react';

const UseRefDemo = () => {
  // useRef
  const [inputValue, setInputValue] = useState('');
  const useRefCount = useRef(0);
  useEffect(() => {
    useRefCount.current = useRefCount.current + 1;
  }, [inputValue]);

  const inputElement = useRef<HTMLInputElement>(null);
  const focusInput = () => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  };

  const previousInputValue = useRef('');

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
      <p>
        Used for counting amount of keeping track of amount of renders without
        re-rendering.
      </p>
      <span>Render Count: {useRefCount.current}</span>
      <p>Used for manipulating the DOM.</p>
      <button onClick={focusInput}>Focus Input</button>
      <p>Used for tracking state changes.</p>
      <p>Current Value: {inputValue}</p>
      <p>Previous Value: {previousInputValue.current}</p>
    </>
  );
};

export default UseRefDemo;
