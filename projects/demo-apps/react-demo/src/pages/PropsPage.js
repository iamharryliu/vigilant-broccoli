import React from 'react';
import { ChildComponent } from '../ChildComponent';

const PropsPage = () => {
  const componentName = 'Main Component';
  const contentFromParent = 'content from parent';
  function parentFunction(childName) {
    alert(`${componentName} fn being called from ${childName}`);
  }

  return (
    <>
      <h2>Props Example</h2>
      <ChildComponent parentFunction={parentFunction}>
        <span>{contentFromParent}</span>
      </ChildComponent>
    </>
  );
};

export default PropsPage;
