import { Box, useTheme } from '@mui/joy';
import type { CalendarDatum } from '@nivo/calendar';
import { scaleSequentialSqrt } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import { format } from 'date-fns';
import { lazy, Suspense, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import type { LoadStatisticsSerialized, TrendSerialized } from './loader.server';

const ResponsiveTimeRange = lazy(() => import('~/components/lazy/ResponsiveTimeRange'));

export type TimeRangeChartProps = {
  period: LoadStatisticsSerialized['period'];
  trend: TrendSerialized[];
  dateGte: string;
  dateLte: string;
  disableUseInView?: boolean;
};

const colors = Array.from(Array(20)).map((_, i) => scaleSequentialSqrt(interpolateYlOrRd).domain([0, 19])(i));

export const TimeRangeChart = ({ trend, dateGte, dateLte, disableUseInView = false }: TimeRangeChartProps) => {
  const { ref, inView } = useInView({ rootMargin: '200px 0px', triggerOnce: true, skip: disableUseInView, initialInView: disableUseInView });
  const { palette } = useTheme();
  const data = useMemo<CalendarDatum[]>(() => trend.map((point) => ({ day: format(new Date(point.x), 'yyyy-MM-dd'), value: point.y })), [trend]);
  return (
    <Box ref={ref} sx={{ position: 'relative', height: 400 }}>
      {inView && (
        <Suspense fallback={null}>
          <ResponsiveTimeRange
            colors={colors}
            data={data}
            dayBorderWidth={0}
            dayRadius={6}
            daySpacing={4}
            emptyColor={palette.danger[50]}
            firstWeekday='monday'
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
      )}
    </Box>
  );
};
