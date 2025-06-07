import { Button, Heading } from '@radix-ui/themes';
import { useState } from 'react';

export const ButtonDemo = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    console.log('jhit');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  return (
    <>
      <Heading>Button Demo</Heading>
      <div className="space-x-4">
        <Button loading={true}>Submit</Button>
        <Button disabled={true}>Disabled Button</Button>
        <Button onClick={handleClick} loading={isLoading}>
          Submit
        </Button>
      </div>
    </>
  );
};
