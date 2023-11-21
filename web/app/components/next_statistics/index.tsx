import { Box, Button, ButtonGroup, Card, Stack, Typography } from '@mui/joy';
import { AggregatedCard } from '~/components/next_statistics/AggregatedCard';
import { Filters } from '~/components/next_statistics/Filters';
import { useState } from 'react';

import { BarChart } from './BarChart';
import { HeatMapChart } from './HeatMapChart';
import type { LoadStatisticsSerialized, TopData } from './loader';
import { TrendChart } from './TrendChart';

export type StatisticsProps = {
  statistics: LoadStatisticsSerialized;
};

type DEVICE_STAT = 'Browser' | 'OS' | 'Device';

export const Statistics = ({ statistics }: StatisticsProps) => {
  const [deviceStat, setDeviceStat] = useState<DEVICE_STAT>('Browser');
  const deviceStats: Record<DEVICE_STAT, TopData[]> = {
    Browser: statistics.topBrowsers,
    OS: statistics.topOS,
    Device: statistics.topDevices,
  };
  return (
    <Stack gap={1}>
      <Stack direction={{ xs: 'column-reverse', lg: 'row' }} gap={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ flex: 1 }}>
          <AggregatedCard count={statistics.totalPageViews.count} emoji='👀' title='Total pageviews' />
          <AggregatedCard count={statistics.currentUsers.count} emoji='🧑' title='Current visitors' />
        </Stack>
        <Filters dateGte={statistics.date.gte} dateLte={statistics.date.lte} />
      </Stack>
      <Card>
        <Typography gutterBottom level='h4'>
          Pageviews trend
        </Typography>
        <TrendChart
          dateGte={statistics.date.gte}
          dateLte={statistics.date.lte}
          period={statistics.period}
          tooltipTitle='Pageviews'
          trend={statistics.pageViewsTrend}
        />
      </Card>
      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card>
          <Typography level='h4'>Top sources</Typography>
          <BarChart countTitle='Visitors' data={statistics.topReferrers} maxCount={statistics.totalPageViews.count} nullText='Direct / None' title='Source' />
        </Card>
        <Card>
          <Typography level='h4'>Top pages</Typography>
          <BarChart countTitle='Visitors' data={statistics.topPages} maxCount={statistics.totalPageViews.count} title='Page' />
        </Card>
        <Card>
          <Stack direction='row' justifyContent='space-between'>
            <Typography level='h4'>Devices</Typography>
            <ButtonGroup size='sm' variant='plain'>
              {Object.keys(deviceStats).map((stat) => (
                <Button key={stat} onClick={() => setDeviceStat(stat as DEVICE_STAT)} variant={stat === deviceStat ? 'soft' : 'plain'}>
                  {stat}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>
          <BarChart countTitle='Visitors' data={deviceStats[deviceStat]} maxCount={statistics.totalPageViews.count} nullText='(Unknown)' title={deviceStat} />
        </Card>
        <Card>
          <Typography level='h4'>Top custom events</Typography>
          <BarChart countTitle='Count' data={statistics.topCustomEvents} title='Event' />
        </Card>
      </Box>
      <Card>
        <Typography gutterBottom level='h4'>
          Unique visitors trend
        </Typography>
        <TrendChart
          dateGte={statistics.date.gte}
          dateLte={statistics.date.lte}
          period={statistics.period}
          tooltipTitle='Unique visitors'
          trend={statistics.uniqueUsersTrend}
        />
      </Card>
      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card>
          <Typography gutterBottom level='h4'>
            Locations
          </Typography>
        </Card>
        <Card>
          <Typography gutterBottom level='h4'>
            Top time of day / week
          </Typography>
          <HeatMapChart data={statistics.hoursOfWeekHeatMap} />
        </Card>
      </Box>
    </Stack>
  );
};
