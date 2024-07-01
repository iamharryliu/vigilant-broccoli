import React, { useState } from 'react';

const ConditionalRenderPage = () => {
  const [condition, setCondition] = useState(true);
  const toggleCondition = () => setCondition(prevCondition => !prevCondition);

  return (
    <>
      <h1>Condition Render</h1>
      <p>Current Boolean Value: {condition.toString()}</p>
      <p>
        Logical && Operator:
        {condition && <span>Appear on true</span>}
      </p>
      <p>
        Ternary Operator:
        {condition ? (
          <span>Appear on true</span>
        ) : (
          <span>Else appear on false</span>
        )}
      </p>
      <button className="btn btn-primary" onClick={() => toggleCondition()}>
        Toggle Condition
      </button>
    </>
  );
};

export default ConditionalRenderPage;
