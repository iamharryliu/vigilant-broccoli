import { Button as RadixButton } from '@radix-ui/themes';
import { useState } from 'react';

type ButtonProps = {
  onClick: () => Promise<void>;
  children: React.ReactNode;
};

export const Button = ({ onClick, children }: ButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  return (
    <RadixButton onClick={handleClick} loading={isLoading}>
      {children}
    </RadixButton>
  );
};
