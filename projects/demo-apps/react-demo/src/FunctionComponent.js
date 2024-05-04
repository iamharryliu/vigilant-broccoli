import React from 'react';

export const FunctionComponent = props => {
  let componentName = 'Child Functional Component';
  return (
    <>
      <h5>Child Component</h5>
      <div>Data from parent: {props.children}</div>
      <button onClick={() => props.parentFunction(componentName)}>
        Child Functional Component Button
      </button>
    </>
  );
};
