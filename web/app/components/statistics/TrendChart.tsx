import type { Serie } from '@nivo/line';
import { format } from 'date-fns';
import { lazy, Suspense, useMemo } from 'react';

import type { LoadStatisticsSerialized, TrendSerialized } from './loader.server';
import { Card } from '../ui/card';
import { Typography } from '../typography';

const ResponsiveLine = lazy(() => import('~/components/lazy/ResponsiveLine'));

export type TrendChartProps = {
  period: LoadStatisticsSerialized['period'];
  trend: TrendSerialized[];
  tooltipTitle: string;
};

export const TrendChart = ({ period, trend, tooltipTitle }: TrendChartProps) => {
  const data = useMemo<Serie[]>(() => [{ id: 'TrendChart', data: trend.map((point) => ({ ...point, x: new Date(point.x) })) }], [trend]);

  return (
    <div className='relative h-[400px]'>
      <Suspense fallback={null}>
        <ResponsiveLine
          axisBottom={{
            format: period === 'day' ? '%b %d' : '%b %d %H:00',
            tickValues: `every ${Math.max(Math.ceil(trend.length / 24), 2)} ${period === 'day' ? 'days' : 'hours'}`,
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
          margin={{ top: 10, right: 15, bottom: 60, left: 60 }}
          pointBorderColor={{ from: 'serieColor' }}
          pointBorderWidth={3}
          pointSize={3}
          sliceTooltip={({ slice }) => (
            <Card>
              <Typography variant='large'>{tooltipTitle}</Typography>
              {slice.points.map((point) => (
                <Typography variant='small' key={point.serieId}>
                  {`${format(slice.points[0].data.x as Date, 'eee, dd MMM yyyy')}: ${Intl.NumberFormat('en-GB', {
                    notation: 'compact',
                    maximumFractionDigits: 2,
                  }).format(Number(point.data.yFormatted))}`}
                </Typography>
              ))}
            </Card>
          )}
          theme={{
            axis: { domain: { line: { stroke: 'var(--color-muted)' } } },
            grid: { line: { stroke: 'var(--color-muted)' } },
            legends: { text: { fill: 'var(--color-foreground)' } },
            text: { fill: 'var(--color-foreground)' },
          }}
          xScale={{
            type: 'time',
            format: period === 'day' ? '%Y-%m-%d' : '%Y-%m-%dT%H',
            useUTC: false,
            precision: period,
          }}
          yScale={{ type: 'linear' }}
        />
      </Suspense>
    </div>
  );
};
