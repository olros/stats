import { Box, useTheme } from '@mui/joy';
import { lazy, Suspense } from 'react';

import type { HeatMap } from './loader.server';

const ResponsiveHeatMap = lazy(() => import('~/components/lazy/ResponsiveHeatMap'));

export type HeatMapProps = {
  data: HeatMap[];
};

export const HeatMapChart = ({ data }: HeatMapProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ position: 'relative', height: 400 }}>
      <Suspense fallback={null}>
        <ResponsiveHeatMap
          colors={{
            type: 'diverging',
            scheme: 'yellow_orange_red',
            minValue: 0,
          }}
          data={data}
          emptyColor={theme.palette.background.level1}
          isInteractive={false}
          margin={{ top: 20, right: 0, bottom: 0, left: 25 }}
          theme={{
            legends: { text: { fill: theme.palette.text.primary } },
            text: { fill: theme.palette.text.primary },
          }}
        />
      </Suspense>
    </Box>
  );
};
