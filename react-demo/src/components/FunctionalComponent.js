import React from 'react';
import { ChildFunctionalComponent } from './ChildFunctionalComponent';
import { ChildClassComponent } from './ChildClassComponent';

export const FunctionalComponent = props => {
  let componentName = 'Functional Component';
  function clickHandler() {
    alert('Button clicked');
  }

  function parentFunction(childName) {
    alert(`${componentName} fn being called from ${childName}`);
  }
  const { value } = props.data;
  return (
    <div>
      <h1>Functional Component</h1>
      <div>Props Data: {value}</div>
      <div>Data from parent: {props.children}</div>
      <button onClick={clickHandler}>Click</button>
      <ChildFunctionalComponent parentFunction={parentFunction} />
      <ChildClassComponent parentFunction={parentFunction} />
    </div>
  );
};
