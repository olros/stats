import { forwardRef } from 'react';
import { cn } from '~/lib/utils';
import { Typography, type TypographyProps } from './typography';

export type RepositoryLinkProps = Omit<TypographyProps, 'asChild'>;

const RepositoryLink = forwardRef<HTMLParagraphElement, RepositoryLinkProps>(({ className, ...props }, ref) => {
  return (
    <Typography ref={ref} asChild variant='small' className={cn('w-min mx-auto text-center py-4 mt-auto', className)} {...props}>
      <a href='https://github.com/olros/stats' target='_blank'>
        @olros/stats
      </a>
    </Typography>
  );
});
RepositoryLink.displayName = 'RepositoryLink';

export { RepositoryLink };
