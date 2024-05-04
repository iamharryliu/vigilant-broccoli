import React from 'react';

export const ChildComponent = props => {
  let componentName = 'Child Functional Component';
  return (
    <>
      <h3>Child Component</h3>
      <button onClick={() => props.parentFunction(componentName)}>
        Child Functional Component Button
      </button>
    </>
  );
};
