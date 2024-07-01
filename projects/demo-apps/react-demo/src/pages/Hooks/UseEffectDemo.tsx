import React, { useEffect, useState } from 'react';

const UseEffectDemo = () => {
  const [state, setState] = useState(0);

  useEffect(() => {
    console.log('This runs when the component is initalized.');
  }, []);
  useEffect(() => {
    console.log('This runs when there is a change to the state.');
  }, [state]);
  useEffect(() => {
    return () => console.log('This runs when component unmounts.');
  }, []);

  const handleButtonClick = () => {
    setState(previousState => {
      return previousState + 1;
    });
  };

  return (
    <>
      <h1>useEffect Demo</h1>
      <p>
        Look at console to see log lines and whhich effects are being hit and
        when.
      </p>
      <p>State: {state}</p>
      <button onClick={() => handleButtonClick()}>Update Context</button>
    </>
  );
};

export default UseEffectDemo;
