import React from 'react';

export const FunctionalComponent = props => {
  return (
    <div>
      <h1>Functional Component</h1>
      <p>Props Data: {props.data}</p>
      {props.children}
    </div>
  );
};
