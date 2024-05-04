import React from 'react';
import { ChildComponent } from './FunctionChildComponent';

export const FunctionComponent = props => {
  let componentName = 'Main Component';

  function parentFunction(childName) {
    alert(`${componentName} fn being called from ${childName}`);
  }
  return (
    <div>
      <h2>Parent Component</h2>
      <div>Data from parent: {props.children}</div>
      <ChildComponent parentFunction={parentFunction} />
    </div>
  );
};
