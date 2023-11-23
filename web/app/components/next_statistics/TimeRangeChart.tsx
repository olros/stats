import { Box, useTheme } from '@mui/joy';
import type { CalendarDatum } from '@nivo/calendar';
import { format } from 'date-fns';
import { lazy, Suspense, useMemo } from 'react';

import type { LoadStatisticsSerialized, TrendSerialized } from './loader.server';

const ResponsiveTimeRange = lazy(() => import('~/components/lazy/ResponsiveTimeRange'));

export type TimeRangeChartProps = {
  period: LoadStatisticsSerialized['period'];
  trend: TrendSerialized[];
  dateGte: string;
  dateLte: string;
};

export const TimeRangeChart = ({ trend, dateGte, dateLte }: TimeRangeChartProps) => {
  const { palette } = useTheme();
  const data = useMemo<CalendarDatum[]>(() => trend.map((point) => ({ day: format(new Date(point.x), 'yyyy-MM-dd'), value: point.y })), [trend]);
  return (
    <Box sx={{ position: 'relative', height: 400 }}>
      <Suspense fallback={null}>
        <ResponsiveTimeRange
          colors={[
            palette.primary[50],
            palette.primary[100],
            palette.primary[200],
            palette.primary[300],
            palette.primary[400],
            palette.primary[500],
            palette.primary[600],
          ]}
          data={data}
          dayBorderColor={palette.background.body}
          dayBorderWidth={4}
          dayRadius={6}
          daySpacing={0}
          emptyColor={palette.danger[50]}
          from={dateGte}
          margin={{ top: 40, right: 0, bottom: 0, left: 40 }}
          minValue={0}
          theme={{
            legends: { text: { fill: palette.text.primary } },
            text: { fill: palette.text.primary },
            tooltip: { container: { background: palette.background.level1, fontSize: 12 } },
          }}
          to={dateLte}
        />
      </Suspense>
    </Box>
  );
};
