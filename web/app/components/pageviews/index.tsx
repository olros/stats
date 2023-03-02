import { Box, Card, Stack, Typography } from '@mui/joy';
import type { AggregatedProps } from '~/components/pageviews/Aggregated';
import { Aggregated } from '~/components/pageviews/Aggregated';
import type { FiltersProps } from '~/components/pageviews/Filters';
import { Filters } from '~/components/pageviews/Filters';
import type { HoursOfTheDayProps } from '~/components/pageviews/HoursOfTheDay';
import { HoursOfTheDay } from '~/components/pageviews/HoursOfTheDay';
import type { TopPagesProps } from '~/components/pageviews/TopPages';
import { TopPages } from '~/components/pageviews/TopPages';
import type { PageviewsTrendProps } from '~/components/pageviews/Trend';
import { PageviewsTrend } from '~/components/pageviews/Trend';

import type { TopCustomEventsProps } from './TopCustomEvents';
import { TopCustomEvents } from './TopCustomEvents';

export type PageviewsStatisticsProps = FiltersProps & AggregatedProps & PageviewsTrendProps & HoursOfTheDayProps & TopPagesProps & TopCustomEventsProps;

export const PageviewsStatistics = ({
  pageViews,
  totalPageviews,
  topPages,
  topHours,
  topCustomEvents,
  mostPopularHour,
  uniqueVisitorsCount,
  dateGte,
  dateLte,
  pathname,
}: PageviewsStatisticsProps) => {
  return (
    <Stack gap={1}>
      <Filters dateGte={dateGte} dateLte={dateLte} pathname={pathname} />
      <Aggregated mostPopularHour={mostPopularHour} totalPageviews={totalPageviews} uniqueVisitorsCount={uniqueVisitorsCount} />
      <Card sx={{ p: 2 }}>
        <Typography gutterBottom level='h3'>
          Pageviews trend
        </Typography>
        <PageviewsTrend dateGte={dateGte} dateLte={dateLte} pageViews={pageViews} />
      </Card>
      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card>
          <Typography level='h3'>Top pages</Typography>
          <Typography gutterBottom level='body2'>
            Which pages get more pageviews
          </Typography>
          <TopPages topPages={topPages} />
        </Card>
        <Card>
          <Typography level='h3'>Top custom events</Typography>
          <Typography gutterBottom level='body2'>
            Number of events per custom event
          </Typography>
          <TopCustomEvents topCustomEvents={topCustomEvents} />
        </Card>
      </Box>
      <Card>
        <Typography level='h3'>Hours of the day</Typography>
        <Typography gutterBottom level='body2'>
          What times during the day has most pageviews
        </Typography>
        <HoursOfTheDay topHours={topHours} />
      </Card>
    </Stack>
  );
};
