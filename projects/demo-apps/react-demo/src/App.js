import React, { createContext, useEffect, useState } from 'react';
import { FunctionComponent } from './FunctionComponent';

const Context = createContext();
const INITIAL_CONTEXT = { key: 'value' };

function App() {
  // Conditionals
  const [condition, setCondition] = useState(false);
  const toggleCondition = () => {
    setCondition(!condition);
  };

  // Lists
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

  // Props
  const componentName = 'Main Component';
  const propsChildrenData = 'content from parent';
  function parentFunction(childName) {
    alert(`${componentName} fn being called from ${childName}`);
  }

  // Hooks
  const [data, setData] = useState(INITIAL_CONTEXT);
  const handleButtonClick = () => {
    setData(previousData => {
      return { ...previousData, newKey: 'newValue!' };
    });
  };
  const resetContext = () => {
    setData(INITIAL_CONTEXT);
  };
  useEffect(() => {
    console.log('something happened to the data');
  }, [data]);

  return (
    <>
      <Context.Provider value={data}>
        <h1>React Demo</h1>
        <h3>Conditionals</h3>
        <button onClick={() => toggleCondition()}>Toggle Condition</button>
        <span>Condition is {JSON.stringify(condition)}</span>
        {condition ? <div>true code block</div> : <div>false code block</div>}
        <h3>Lists</h3>
        {items.map(item => (
          <div key={item.id}>{JSON.stringify(item)}</div>
        ))}
        <h3>Hooks</h3>
        Context:
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <button onClick={() => handleButtonClick()}>Update Context</button>
        <button onClick={() => resetContext()}>Reset Context</button>
        <h3>Props</h3>
        <FunctionComponent parentFunction={parentFunction}>
          <span>{propsChildrenData}</span>
        </FunctionComponent>
      </Context.Provider>
    </>
  );
}

export default App;
