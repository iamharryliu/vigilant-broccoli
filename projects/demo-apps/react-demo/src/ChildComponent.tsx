import React from 'react';

export const ChildComponent = (props: {
  children: any;
  parentFunction: any;
}) => {
  let componentName = 'Child Functional Component';
  return (
    <>
      <h3>Child Component</h3>
      <div>Data from parent: {props.children}</div>
      <button onClick={() => props.parentFunction(componentName)}>
        Child Functional Component Button
      </button>
    </>
  );
};
