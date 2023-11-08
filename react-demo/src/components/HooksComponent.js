import React, { useEffect, useState } from 'react';

export function HookComponent() {
  const initialCount = 0;
  const [count, setCount] = useState(initialCount);

  const [name, setName] = useState({ firstName: 'first', lastName: 'last' });
  useEffect(() => {
    console.log('similar to component did mount lifecycle hook');
    return () => {
      console.log('similar to component un mount lifecycle hook');
    };
  }, []);
  useEffect(() => {
    console.log('should only log on count change');
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      Count: {count}
      <button onClick={() => setCount(prevCount => prevCount + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <form>
        <input
          type="text"
          value={name.firstName}
          onChange={e => setName({ ...name, firstName: e.target.value })}
        ></input>
        <input
          type="text"
          value={name.lastName}
          onChange={e => setName({ ...name, lastName: e.target.value })}
        ></input>
      </form>
      <p>Your first name: {name.firstName}</p>
      <p>Your first name: {name.lastName}</p>
    </div>
  );
}
