import React from 'react';

export const ChildFunctionalComponent = props => {
  let componentName = 'Child Functional Component';
  return (
    <div>
      <button onClick={() => props.parentFunction(componentName)}>
        Child Functional Component Button
      </button>
    </div>
  );
};
