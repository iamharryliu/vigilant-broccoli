import React, { useState } from 'react';

const INITIAL_STATE = { key: 'value' };

const UseStateDemo = () => {
  const [state, setState] = useState(INITIAL_STATE);

  const handleButtonClick = () => {
    setState(previousState => {
      return { ...previousState, newKey: 'newValue!' };
    });
  };

  const resetState = () => {
    setState(INITIAL_STATE);
  };

  return (
    <>
      <h1>useState</h1>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <button
        className="btn btn-primary me-2"
        onClick={() => handleButtonClick()}
      >
        setState
      </button>
      <button className="btn btn-primary" onClick={() => resetState()}>
        resetState
      </button>
    </>
  );
};

export default UseStateDemo;
