import { Box, Card, Typography, useTheme } from '@mui/joy';
import { ResponsiveBar } from '@nivo/bar';
import { Suspense } from 'react';

import type { getTopHours } from './loaders';

export type Hour = Awaited<ReturnType<typeof getTopHours>>[number];

export type HoursOfTheDayProps = {
  topHours: Hour[];
};

export const HoursOfTheDay = ({ topHours }: HoursOfTheDayProps) => {
  const theme = useTheme();
  return (
    <Suspense fallback={null}>
      <Box sx={{ position: 'relative', height: 400 }}>
        <ResponsiveBar
          ariaLabel='Hours of the day'
          axisLeft={{ tickSize: 15 }}
          colors={{ scheme: 'dark2' }}
          data={topHours}
          indexBy='hour'
          keys={['percentage']}
          label={(bar) => `${bar.data.label}`}
          layout='horizontal'
          margin={{ top: 0, right: 20, bottom: 20, left: 35 }}
          padding={0.05}
          theme={{
            textColor: theme.palette.text.primary,
            axis: {
              domain: { line: { stroke: theme.palette.background.level1 } },
            },
            grid: {
              line: { stroke: theme.palette.background.level1 },
            },
          }}
          tooltip={({ value }) => (
            <Typography component={Card} fontSize='md' fontWeight='bold'>
              {value}
            </Typography>
          )}
          valueScale={{ type: 'linear' }}
        />
      </Box>
    </Suspense>
  );
};
