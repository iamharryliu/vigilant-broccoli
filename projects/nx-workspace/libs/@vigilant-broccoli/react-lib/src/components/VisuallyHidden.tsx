import { ComponentProps } from 'react';

export const VisuallyHidden = (props: ComponentProps<'span'>) => (
  <span className="sr-only" {...props} />
);
