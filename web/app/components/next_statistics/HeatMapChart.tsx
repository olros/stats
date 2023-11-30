import { Box, useTheme } from '@mui/joy';
import { lazy, Suspense } from 'react';
import { useInView } from 'react-intersection-observer';

import type { HeatMap } from './loader.server';

const ResponsiveHeatMap = lazy(() => import('~/components/lazy/ResponsiveHeatMap'));

export type HeatMapProps = {
  data: HeatMap[];
  disableUseInView?: boolean;
};

export const HeatMapChart = ({ data, disableUseInView = false }: HeatMapProps) => {
  const { ref, inView } = useInView({ rootMargin: '200px 0px', triggerOnce: true, skip: disableUseInView, initialInView: disableUseInView });
  const theme = useTheme();
  return (
    <Box ref={ref} sx={{ position: 'relative', height: 400 }}>
      {inView && (
        <Suspense fallback={null}>
          <ResponsiveHeatMap
            colors={{
              type: 'sequential',
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
      )}
    </Box>
  );
};
