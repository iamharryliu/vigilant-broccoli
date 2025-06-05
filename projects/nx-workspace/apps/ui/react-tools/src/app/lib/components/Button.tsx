import { Button as RadixButton } from '@radix-ui/themes';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface LoadingButtonProps extends React.ComponentProps<'button'> {
  isLoading?: boolean;
  children?: ReactNode;
}

export const Button = ({
  isLoading,
  children,
  disabled,
  onClick,
}: LoadingButtonProps) => {
  return (
    <RadixButton onClick={onClick} disabled={isLoading || disabled}>
      {isLoading && <Loader2 className="animate-spin h-4 w-4 absolute " />}
      <span className={isLoading ? 'invisible' : 'visible'}>{children}</span>
    </RadixButton>
  );
};
