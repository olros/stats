import { Box, Button, ButtonGroup, Card, Chip, Stack, Typography } from '@mui/joy';
import { AggregatedCard } from '~/components/next_statistics/AggregatedCard';
import { Filters } from '~/components/next_statistics/Filters';
import { useState } from 'react';

import { BarChart } from './BarChart';
import { HeatMapChart } from './HeatMapChart';
import type { LoadStatisticsSerialized, TopData } from './loader.server';
import { TrendChart } from './TrendChart';
import { CURRENT_VISITORS_LAST_MINUTES } from './utils';

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
          <AggregatedCard
            count={statistics.currentVisitors.count}
            emoji='🧑'
            title='Current visitors'
            tooltip={`The number of visitors currently on your site. This does not depend on the applied filters. It includes all visitors who have loaded a page in the last ${CURRENT_VISITORS_LAST_MINUTES} minutes`}
          />
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
        <Typography level='h4'>Unique visitors trend</Typography>
        <Typography gutterBottom level='body-sm'>
          Visitors are counted by creating a hash consisting of the visitor's{' '}
          <Chip color='primary' component='span' size='sm' variant='outlined'>
            User-Agent
          </Chip>
          {', '}
          <Chip color='primary' component='span' size='sm' variant='outlined'>
            IP-address
          </Chip>
          {', '}
          <Chip color='primary' component='span' size='sm' variant='outlined'>
            a random secret
          </Chip>
          {', and '}
          <Chip color='primary' component='span' size='sm' variant='outlined'>
            today's date
          </Chip>
          . It's therefore not possible to track users over multiple days, count returning users, or a total amount of users during a period of more than one
          day.
        </Typography>
        <TrendChart
          dateGte={statistics.date.gte}
          dateLte={statistics.date.lte}
          period={statistics.period}
          tooltipTitle='Unique visitors'
          trend={statistics.uniqueVisitorsTrend}
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
