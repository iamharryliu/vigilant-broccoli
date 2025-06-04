import { Button as ShadcnButton } from '@/components/ui/button';
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
  ...props
}: LoadingButtonProps) => {
  return (
    <ShadcnButton disabled={isLoading || disabled} {...props}>
      {isLoading && <Loader2 className="animate-spin h-4 w-4 absolute " />}
      <span className={isLoading ? 'invisible' : 'visible'}>{children}</span>
    </ShadcnButton>
  );
};
