import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
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

  // Custome Hooks
  const [data] = useFetch('https://jsonplaceholder.typicode.com/todos');

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
        {data &&
          data.slice(0, 2).map(item => {
            return <p key={item.id}>{item.title}</p>;
          })}
      </Context.Provider>
    </>
  );
};

const HooksChild = () => {
  // useContext
  const state = useContext(Context);
  return (
    <>
      <h3>Child Component</h3>
      {JSON.stringify(state, null, 2)}
    </>
  );
};

export default HooksPage;
