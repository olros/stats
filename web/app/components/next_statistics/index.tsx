import { Alert, Box, Button, ButtonGroup, Card, Chip, Stack, Typography } from '@mui/joy';
import { AggregatedCard } from '~/components/next_statistics/AggregatedCard';
import { Filters } from '~/components/next_statistics/Filters';
import { useState } from 'react';

import { BarChart } from './BarChart';
import { GlobeWithCities } from './GlobeWithCities';
import { HeatMapChart } from './HeatMapChart';
import type { LoadStatisticsSerialized, TopData } from './loader.server';
import { TimeRangeChart } from './TimeRangeChart';
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
      <Alert color='primary'>
        The new Stats is in Beta. Pageviews are collected in a new format with more data, including device types and locations which enables more user-insight.
        Since it is a completely new data-format, data collected until now can't be transferred. Therefore, data will be collected in to both the current and
        new format until the new format has enough data to replace the current format. The old data will then be deleted sometime after January 1st 2024.
      </Alert>
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
        <Filters dateGte={statistics.date.gte} dateLte={statistics.date.lte} period={statistics.period} />
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
          <Typography level='h4'>Geolocations</Typography>
          <GlobeWithCities data={statistics.topGeoLocations} />
        </Card>
        <Card>
          <Typography level='h4'>Top locations</Typography>
          <BarChart countTitle='Visitors' data={statistics.topGeoLocations} title='Location' />
        </Card>
        <Card>
          <Typography level='h4'>Top time of day / week</Typography>
          <Typography level='body-sm'>The hours are in UTC-time</Typography>
          <HeatMapChart data={statistics.hoursOfWeekHeatMap} />
        </Card>
        <Card>
          <Typography level='h4'>Calendar</Typography>
          {statistics.period === 'hour' ? (
            <Typography level='body-md'>Calendar is not supported when period is set to "Hour"</Typography>
          ) : (
            <TimeRangeChart dateGte={statistics.date.gte} dateLte={statistics.date.lte} period={statistics.period} trend={statistics.pageViewsTrend} />
          )}
        </Card>
      </Box>
    </Stack>
  );
};
