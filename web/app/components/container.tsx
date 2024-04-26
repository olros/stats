import { forwardRef } from 'react';
import { cn } from '~/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(({ className, ...props }, ref) => {
  return <div className={cn('py-2 flex flex-col gap-2 min-h-[95vh] w-full max-w-6xl px-2 sm:px-4 mx-auto', className)} ref={ref} {...props} />;
});
Container.displayName = 'Container';

export { Container };
