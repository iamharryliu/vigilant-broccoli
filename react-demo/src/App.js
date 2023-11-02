import React from 'react';
import { FunctionalComponent } from './components/FunctionalComponent';
import { ClassComponent } from './components/ClassComponent';

function App() {
  const props = {
    value: 'Prop value',
    incrementValue: 1,
  };
  const propsChildrenData = 'content from parent';
  return (
    <div>
      <FunctionalComponent data={props}>
        <span>{propsChildrenData}</span>
      </FunctionalComponent>
      <ClassComponent data={props}>
        <span>{propsChildrenData}</span>
      </ClassComponent>
    </div>
  );
}

export default App;
