import { forwardRef } from 'react';
import { cn } from '~/lib/utils';
import { Typography, type TypographyProps } from './typography';

export type RepositoryLinkProps = Omit<TypographyProps, 'asChild'>;

const RepositoryLink = forwardRef<HTMLParagraphElement, RepositoryLinkProps>(({ className, ...props }, ref) => {
  return (
    <Typography ref={ref} asChild variant='small' className={cn('mx-auto mt-auto w-min py-4 text-center', className)} {...props}>
      <a href='https://github.com/olros/stats' target='_blank'>
        @olros/stats
      </a>
    </Typography>
  );
});
RepositoryLink.displayName = 'RepositoryLink';

export { RepositoryLink };
