import React, { useReducer } from 'react';

const REDUCER_ACTION = {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
} as const;
type REDUCER_ACTION_KEYS = keyof typeof REDUCER_ACTION;
export type ReducerAction = (typeof REDUCER_ACTION)[REDUCER_ACTION_KEYS];

const INITIAL_COUNT = 0;
const reducer = (state: number, action: { type: ReducerAction }) => {
  switch (action.type) {
    case REDUCER_ACTION.INCREMENT:
      return state + 1;
    case REDUCER_ACTION.DECREMENT:
      return state - 1;
    case REDUCER_ACTION.RESET:
      return INITIAL_COUNT;
    default:
      return state;
  }
};

const UseReducerDemo = () => {
  const [count, dispatch] = useReducer(reducer, INITIAL_COUNT);

  const increment = () => {
    dispatch({ type: REDUCER_ACTION.INCREMENT });
  };
  const decrement = () => {
    dispatch({ type: REDUCER_ACTION.DECREMENT });
  };
  const reset = () => {
    dispatch({ type: REDUCER_ACTION.RESET });
  };

  return (
    <>
      <h1>useReducer</h1>
      <div>{count}</div>
      <button className="btn btn-primary me-2" onClick={() => increment()}>
        +
      </button>
      <button className="btn btn-primary me-2" onClick={() => decrement()}>
        -
      </button>
      <button className="btn btn-primary me-2" onClick={() => reset()}>
        Reset
      </button>
    </>
  );
};

export default UseReducerDemo;
