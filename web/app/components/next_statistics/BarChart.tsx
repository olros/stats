import { Box, Typography } from '@mui/joy';
import { Fragment } from 'react';

import type { TopData } from './loader.server';

export type BarChartProps = {
  data: TopData[];
  maxCount?: number;
  title: string;
  countTitle: string;
  nullText?: string;
};

export const BarChart = ({ data, maxCount, title, countTitle, nullText }: BarChartProps) => {
  const gridTemplateColumns = maxCount ? '1fr 4.5rem 4.5rem' : '1fr 4.5rem';
  if (data.length === 0) {
    return <Typography level='body-md'>Found none registered with the current filters</Typography>;
  }
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns, gap: 1 }}>
        <Typography level='body-sm'>{title}</Typography>
        <Typography level='body-sm' sx={{ textAlign: 'right' }}>
          {countTitle}
        </Typography>
        {maxCount !== undefined && (
          <Typography level='body-sm' sx={{ textAlign: 'right' }}>
            %
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns, rowGap: 0.5, columnGap: 1, maxHeight: 400, overflow: 'auto' }}>
        {data.map((row) => (
          <Fragment key={row.name}>
            <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${(row.count / data[0].count) * 100}%`,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  background: ({ palette }) => palette.background.backdrop,
                  borderRadius: ({ radius }) => radius.xs,
                }}
              />
              <Typography level='body-md' sx={{ py: 0.5, px: 1, position: 'relative', zIndex: 2, wordBreak: 'break-word' }}>
                {decodeURIComponent(row.name || nullText || '')}
              </Typography>
            </Box>
            <Typography level='body-md' sx={{ py: 0.5, textAlign: 'right' }}>
              {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(row.count)}
            </Typography>
            {maxCount !== undefined && (
              <Typography level='body-md' sx={{ py: 0.5, textAlign: 'right' }}>
                {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format((row.count / maxCount) * 100)}
              </Typography>
            )}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
};
