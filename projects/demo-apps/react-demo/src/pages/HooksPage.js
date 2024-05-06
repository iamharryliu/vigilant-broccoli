import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import useFetch from '../custom-hooks/useFetch';

// createContext
const Context = createContext();

const HooksPage = () => {
  // useState
  const INITIAL_STATE = { key: 'value' };
  const [state, setState] = useState(INITIAL_STATE);
  const handleButtonClick = () => {
    setState(previousState => {
      return { ...previousState, newKey: 'newValue!' };
    });
    dispatch({ type: REDUCER_ACTION.TYPE_1 });
  };
  const resetContext = () => {
    dispatch({});
    setState(INITIAL_STATE);
  };

  // useEffect
  useEffect(() => {
    console.log('This should only run once.');
  }, []);
  useEffect(() => {
    console.log('This runs when there is a change to the state.');
  }, [state]);

  // useReducer
  const REDUCER_ACTION = {
    TYPE_1: 'TYPE_1',
  };
  const INITIAL_COUNT = 0;
  const reducer = (state, action) => {
    switch (action.type) {
      case REDUCER_ACTION.TYPE_1:
        return state + 1;
      default:
        return 0;
    }
  };
  const [count, dispatch] = useReducer(reducer, INITIAL_COUNT);

  // Custom Hooks
  const [data] = useFetch('https://jsonplaceholder.typicode.com/todos');

  // useRef
  const [inputValue, setInputValue] = useState('');
  const useRefCount = useRef(0);
  useEffect(() => {
    useRefCount.current = useRefCount.current + 1;
  });

  const inputElement = useRef();
  const focusInput = () => {
    inputElement.current.focus();
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
        {count}
        <h3>useContext</h3>
        <HooksChild />
        <h3>Custom Hooks</h3>
        <h4>useFetch</h4>
        {data &&
          data.slice(0, 2).map(item => {
            return <p key={item.id}>{item.title}</p>;
          })}
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

const HooksChild = () => {
  // useContext
  const state = useContext(Context);
  return (
    <>
      <h4>Child Component</h4>
      {JSON.stringify(state, null, 2)}
    </>
  );
};

export default HooksPage;
