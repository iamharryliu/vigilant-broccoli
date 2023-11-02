import React from 'react';

export const FunctionalComponent = props => {
  return (
    <div>
      <h1>Functional Component</h1>
      <div>Props Data: {props.data.value}</div>
      <div>Data from parent: {props.children}</div>
    </div>
  );
};
