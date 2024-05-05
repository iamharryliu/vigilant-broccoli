import React, { useState } from 'react';

const ConditionalsPage = () => {
  const [condition, setCondition] = useState(false);
  const toggleCondition = () => {
    setCondition(!condition);
  };

  return (
    <>
      <h2>Condition Examples</h2>
      <button onClick={() => toggleCondition()}>Toggle Condition</button>
      <span>Condition is {JSON.stringify(condition)}</span>
      {condition ? <div>true code block</div> : <div>false code block</div>}
    </>
  );
};

export default ConditionalsPage;
