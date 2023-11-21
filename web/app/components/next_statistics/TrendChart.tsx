import { Box, Card, Typography, useTheme } from '@mui/joy';
import type { Serie } from '@nivo/line';
import { format } from 'date-fns';
import { lazy, Suspense, useMemo } from 'react';

import type { LoadStatisticsSerialized, TrendSerialized } from './loader';

const ResponsiveLine = lazy(() => import('~/components/nivo/ResponsiveLine'));

export type TrendChartProps = {
  period: LoadStatisticsSerialized['period'];
  trend: TrendSerialized;
  dateGte: string;
  dateLte: string;
  tooltipTitle: string;
};

export const TrendChart = ({ period, trend, dateGte, dateLte, tooltipTitle }: TrendChartProps) => {
  const theme = useTheme();
  const data = useMemo<Serie[]>(() => [{ id: 'TrendChart', data: trend.map((point) => ({ ...point, x: new Date(point.x) })) }], [trend]);

  return (
    <Box sx={{ position: 'relative', height: 400 }}>
      <Suspense fallback={null}>
        <ResponsiveLine
          axisBottom={{
            format: '%b %d',
            tickValues: 'every 2 days',
            tickRotation: -45,
          }}
          axisLeft={{
            format: (val: number) => Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(val),
          }}
          colors={{ scheme: 'paired' }}
          curve='monotoneX'
          data={data}
          enableArea
          enableSlices='x'
          margin={{ top: 10, right: 15, bottom: 45, left: 45 }}
          pointBorderColor={{ from: 'serieColor' }}
          pointBorderWidth={3}
          pointSize={3}
          sliceTooltip={({ slice }) => (
            <Card sx={{ gap: 0 }}>
              <Typography fontSize='md' fontWeight='bold'>
                {tooltipTitle}
              </Typography>
              {slice.points.map((point) => (
                <Typography fontSize='sm' key={point.serieId}>
                  {`${format(slice.points[0].data.x as Date, 'eee, dd MMM yyyy')}: ${Intl.NumberFormat('en-GB', {
                    notation: 'compact',
                    maximumFractionDigits: 2,
                  }).format(Number(point.data.yFormatted))}`}
                </Typography>
              ))}
            </Card>
          )}
          theme={{
            axis: { domain: { line: { stroke: theme.palette.background.level1 } } },
            grid: { line: { stroke: theme.palette.background.level1 } },
            legends: { text: { fill: theme.palette.text.primary } },
            text: { fill: theme.palette.text.primary },
          }}
          xFormat='time:%Y-%m-%d'
          xScale={{
            type: 'time',
            format: '%Y-%m-%d',
            useUTC: false,
            precision: period,
            min: dateGte,
            max: dateLte,
          }}
          yScale={{ type: 'linear' }}
        />
      </Suspense>
    </Box>
  );
};
