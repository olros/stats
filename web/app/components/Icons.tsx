import type { BoxProps } from '@mui/joy';
import { Box } from '@mui/joy';

const IconBase = ({ sx, ...props }: IconProps) => (
  <Box component='svg' stroke='currentColor' sx={{ height: 24, width: 24, ...sx }} viewBox='0 0 48 48' {...props} />
);

export type IconProps = BoxProps<'svg'>;

export const Check = (props: IconProps) => (
  <IconBase {...props} fill='currentColor'>
    <path d='M18.9 35.7 7.7 24.5l2.15-2.15 9.05 9.05 19.2-19.2 2.15 2.15Z' />
  </IconBase>
);

export const UnfoldMore = (props: IconProps) => (
  <IconBase {...props} fill='currentColor'>
    <path d='m24 42-9-9 2.2-2.2 6.8 6.8 6.8-6.8L33 33Zm-6.8-24.6L15 15.2l9-9 9 9-2.2 2.2-6.8-6.8Z' />
  </IconBase>
);

export const Add = (props: IconProps) => (
  <IconBase {...props} fill='currentColor'>
    <path d='M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z' />
  </IconBase>
);
