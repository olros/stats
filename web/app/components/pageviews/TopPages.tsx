import { Box, Divider, Typography } from '@mui/joy';
import type { PageView } from '@prisma/client';
import { Fragment } from 'react';

export type TopPagesProps = {
  topPages: Pick<PageView, 'pathname' | 'count'>[];
};

export const TopPages = ({ topPages }: TopPagesProps) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 0.5 }}>
      {topPages.map((page, i) => (
        <Fragment key={page.pathname}>
          <Typography fontFamily='monospace' sx={{ ml: 0.5, overflowWrap: 'anywhere' }}>
            {page.pathname}
          </Typography>
          <Typography sx={{ mr: 0.5, textAlign: 'right' }}>
            {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(page.count)}
          </Typography>
          {i !== topPages.length - 1 && <Divider sx={{ gridColumn: 'span 2', my: 0.25 }} />}
        </Fragment>
      ))}
    </Box>
  );
};
