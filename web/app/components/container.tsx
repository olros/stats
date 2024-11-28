import { forwardRef } from 'react';
import { cn } from '~/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(({ className, ...props }, ref) => {
  return <div className={cn('mx-auto flex min-h-[95vh] w-full max-w-6xl flex-col gap-2 px-2 py-2 sm:px-4', className)} ref={ref} {...props} />;
});
Container.displayName = 'Container';

export { Container };
