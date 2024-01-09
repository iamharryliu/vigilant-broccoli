import React, { useState } from 'react';
import { FunctionalComponent } from './components/FunctionalComponent';
import { ClassComponent } from './components/ClassComponent';
import { HookComponent } from './components/HooksComponent';

function App() {
  const props = {
    value: 'Prop value',
    incrementValue: 1,
  };
  const propsChildrenData = 'content from parent';
  const [display, setDisplay] = useState(true);
  return (
    <div>
      <FunctionalComponent data={props}>
        <span>{propsChildrenData}</span>
      </FunctionalComponent>
      <ClassComponent data={props}>
        <span>{propsChildrenData}</span>
      </ClassComponent>
      <button onClick={() => setDisplay(prevDisplay => !prevDisplay)}>
        Display
      </button>
      {display && <HookComponent></HookComponent>}
    </div>
  );
}

export default App;
