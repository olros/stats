import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      p: 'leading-5 [&:not(:first-child)]:mt-2',
      h1: 'text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      h3: 'text-2xl font-semibold tracking-tight',
      h4: 'text-xl font-semibold tracking-tight',
      large: 'text-lg font-semibold',
      small: 'text-sm font-small leading-none',
      muted: 'text-sm text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export interface TypographyProps extends React.ParamHTMLAttributes<HTMLParagraphElement>, VariantProps<typeof typographyVariants> {
  asChild?: boolean;
}

const variantToComponent: Record<Exclude<TypographyProps['variant'], undefined | null>, string> = {
  p: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  large: 'p',
  small: 'p',
  muted: 'p',
};

const Typography = React.forwardRef<HTMLParagraphElement, TypographyProps>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : variant ? variantToComponent[variant] : 'p';
  return <Comp className={cn(typographyVariants({ variant, className }))} ref={ref} {...props} />;
});
Typography.displayName = 'Typography';

export { Typography, typographyVariants };
