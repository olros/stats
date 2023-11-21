import { Card, Stack, Typography } from '@mui/joy';
import { AggregatedCard } from '~/components/next_statistics/AggregatedCard';
import { Filters } from '~/components/next_statistics/Filters';

import type { LoadStatisticsSerialized } from './loader';
import { TrendChart } from './TrendChart';

export type StatisticsProps = {
  statistics: LoadStatisticsSerialized;
};

export const Statistics = ({ statistics }: StatisticsProps) => {
  return (
    <Stack gap={1}>
      <Stack direction={{ xs: 'column-reverse', lg: 'row' }} gap={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ flex: 1 }}>
          <AggregatedCard count={statistics.totalPageViews.count} emoji='👀' title='Total pageviews' />
          <AggregatedCard count={statistics.currentUsers.count} emoji='🧑' title='Current visitors' />
        </Stack>
        <Filters dateGte={statistics.date.gte} dateLte={statistics.date.lte} />
      </Stack>
      <Card sx={{ p: 2 }}>
        <Typography gutterBottom level='h3'>
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
      {/* <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card>
          <Typography level='h3'>Top pages</Typography>
          <Typography gutterBottom level='body-md'>
            Which pages get more pageviews
          </Typography>
          <TopPages topPages={topPages} />
        </Card>
        <Card>
          <Typography level='h3'>Top custom events</Typography>
          <Typography gutterBottom level='body-md'>
            Number of events per custom event
          </Typography>
          <TopCustomEvents topCustomEvents={topCustomEvents} />
        </Card>
      </Box>
      <Card>
        <Typography level='h3'>Hours of the day</Typography>
        <Typography gutterBottom level='body-md'>
          What times during the day has most pageviews
        </Typography>
        <HoursOfTheDay topHours={topHours} />
      </Card>
      <Card sx={{ p: 2 }}>
        <Typography gutterBottom level='h3'>
          Unique visitors trend
        </Typography>
        <VisitorsTrend dateGte={dateGte} dateLte={dateLte} pageVisitorsTrend={pageVisitorsTrend} />
      </Card> */}
    </Stack>
  );
};
