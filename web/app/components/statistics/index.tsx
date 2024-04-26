import { AggregatedCard } from '~/components/statistics/AggregatedCard';
import { Filters } from '~/components/statistics/Filters';
import { useState } from 'react';

import { BarChart } from './BarChart';
import { GlobeWithCities } from './GlobeWithCities';
import { HeatMapChart } from './HeatMapChart';
import type { LoadStatisticsSerialized, TopData } from './loader.server';
import { TimeRangeChart } from './TimeRangeChart';
import { TrendChart } from './TrendChart';
import { CURRENT_VISITORS_LAST_MINUTES } from './utils';
import { Card } from '../ui/card';
import { Typography } from '../typography';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Badge } from '../ui/badge';

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
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col-reverse lg:flex-row gap-2'>
        <div className='flex flex-col sm:flex-row gap-2 flex-1'>
          <AggregatedCard count={statistics.totalPageViews.count} emoji='👀' title='Total pageviews' />
          <AggregatedCard
            count={statistics.currentVisitors.count}
            emoji='🧑'
            title='Current visitors'
            tooltip={`The number of visitors currently on your site. This does not depend on the applied filters. It includes all visitors who have loaded a page in the last ${CURRENT_VISITORS_LAST_MINUTES} minutes`}
          />
        </div>
        <Filters dateGte={statistics.date.gte} dateLte={statistics.date.lte} period={statistics.period} />
      </div>
      <Card>
        <Typography variant='h4'>Pageviews trend</Typography>
        <TrendChart period={statistics.period} tooltipTitle='Pageviews' trend={statistics.pageViewsTrend} />
      </Card>
      <div className='grid gap-2 grid-cols-1 md:grid-cols-2'>
        <Card>
          <Typography variant='h4'>Top sources</Typography>
          <BarChart countTitle='Pageviews' data={statistics.topReferrers} maxCount={statistics.totalPageViews.count} nullText='Direct / None' title='Source' />
        </Card>
        <Card>
          <Typography variant='h4'>Top pages</Typography>
          <BarChart countTitle='Pageviews' data={statistics.topPages} maxCount={statistics.totalPageViews.count} title='Page' />
        </Card>
        <Card>
          <div className='flex justify-between'>
            <Typography variant='h4'>Devices</Typography>
            <ToggleGroup defaultValue={Object.keys(deviceStats)[0]} type='single'>
              {Object.keys(deviceStats).map((stat) => (
                <ToggleGroupItem key={stat} value={stat} onClick={() => setDeviceStat(stat as DEVICE_STAT)}>
                  {stat}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <BarChart countTitle='Pageviews' data={deviceStats[deviceStat]} maxCount={statistics.totalPageViews.count} nullText='(Unknown)' title={deviceStat} />
        </Card>
        <Card>
          <Typography variant='h4'>Top custom events</Typography>
          <BarChart countTitle='Count' data={statistics.topCustomEvents} title='Event' />
        </Card>
      </div>
      <Card>
        <Typography variant='h4'>Unique visitors trend</Typography>
        <Typography>
          Visitors are counted by creating a hash consisting of the visitor's{' '}
          <Badge variant='outline' asChild>
            <span>User-Agent</span>
          </Badge>
          {', '}
          <Badge variant='outline' asChild>
            <span>IP-address</span>
          </Badge>
          {', '}
          <Badge variant='outline' asChild>
            <span>a random secret</span>
          </Badge>
          {', and '}
          <Badge variant='outline' asChild>
            <span>today's date</span>
          </Badge>
          . It's therefore not possible to track users over multiple days, count returning users, or a total amount of users during a period of more than one
          day.
        </Typography>
        <TrendChart period={statistics.period} tooltipTitle='Unique visitors' trend={statistics.uniqueVisitorsTrend} />
      </Card>
      <div className='grid gap-2 grid-cols-1 md:grid-cols-2'>
        <Card>
          <Typography variant='h4'>Geolocations</Typography>
          <GlobeWithCities data={statistics.topGeoLocations} />
        </Card>
        <Card>
          <Typography variant='h4'>Top locations</Typography>
          <BarChart countTitle='Pageviews' data={statistics.topGeoLocations} title='Location' />
        </Card>
        <Card>
          <Typography variant='h4'>Top time of day / week</Typography>
          <Typography>The hours are in UTC-time</Typography>
          <HeatMapChart data={statistics.hoursOfWeekHeatMap} />
        </Card>
        <Card>
          <Typography variant='h4'>Calendar</Typography>
          {statistics.period === 'hour' ? (
            <Typography>Calendar is not supported when period is set to "Hour"</Typography>
          ) : (
            <TimeRangeChart dateGte={statistics.date.gte} dateLte={statistics.date.lte} period={statistics.period} trend={statistics.pageViewsTrend} />
          )}
        </Card>
      </div>
    </div>
  );
};
