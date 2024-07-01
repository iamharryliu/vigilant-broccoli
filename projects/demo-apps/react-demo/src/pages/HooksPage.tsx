import React, {
  createContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

const INITIAL_STATE = { key: 'value' };
const Context = createContext<{ key: string }>(INITIAL_STATE);

const REDUCER_ACTION = {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
} as const;
type REDUCER_ACTION_KEYS = keyof typeof REDUCER_ACTION;
export type ReducerAction = (typeof REDUCER_ACTION)[REDUCER_ACTION_KEYS];

const HooksPage = () => {
  const [state, setState] = useState(INITIAL_STATE);
  const handleButtonClick = () => {
    setState(previousState => {
      return { ...previousState, newKey: 'newValue!' };
    });
  };
  const resetContext = () => {
    dispatch({ type: REDUCER_ACTION.RESET });
    setState(INITIAL_STATE);
  };

  // useEffect
  useEffect(() => {
    console.log('This should only run once.');
  }, []);
  useEffect(() => {
    console.log('This runs when there is a change to the state.');
  }, [state]);
  useEffect(() => {
    return () => console.log('This runs when component unmounts.');
  }, []);

  const INITIAL_COUNT = 0;
  const reducer = (state: any, action: { type: ReducerAction }) => {
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
  const [count, dispatch] = useReducer(reducer, INITIAL_COUNT);
  const incrementReducer = () => {
    dispatch({ type: REDUCER_ACTION.INCREMENT });
  };
  const decrementReducer = () => {
    dispatch({ type: REDUCER_ACTION.DECREMENT });
  };
  const resetReducer = () => {
    dispatch({ type: REDUCER_ACTION.RESET });
  };

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
      <Context.Provider value={state}>
        <h2>Hooks Page</h2>
        <h3>useState</h3>
        <pre>{JSON.stringify(state, null, 2)}</pre>

        <h3>useState - setState</h3>
        <button onClick={() => handleButtonClick()}>Update Context</button>
        <button onClick={() => resetContext()}>Reset Context</button>

        <h3>useReducer</h3>
        <button onClick={() => incrementReducer()}>Increment</button>
        <button onClick={() => decrementReducer()}>Decrement</button>
        <button onClick={() => resetReducer()}>Reset</button>
        {count}

        <h3>useContext</h3>

        <h3>Custom Hooks</h3>

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
      </Context.Provider>
    </>
  );
};

export default HooksPage;
