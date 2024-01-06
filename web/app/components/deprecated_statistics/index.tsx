import { Alert, Box, Card, Stack, Typography } from '@mui/joy';
import type { AggregatedProps } from '~/components/deprecated_statistics/Aggregated';
import { Aggregated } from '~/components/deprecated_statistics/Aggregated';
import type { FiltersProps } from '~/components/deprecated_statistics/Filters';
import { Filters } from '~/components/deprecated_statistics/Filters';
import type { HoursOfTheDayProps } from '~/components/deprecated_statistics/HoursOfTheDay';
import { HoursOfTheDay } from '~/components/deprecated_statistics/HoursOfTheDay';
import type { PageviewsTrendProps } from '~/components/deprecated_statistics/PageviewsTrend';
import { PageviewsTrend } from '~/components/deprecated_statistics/PageviewsTrend';
import type { TopPagesProps } from '~/components/deprecated_statistics/TopPages';
import { TopPages } from '~/components/deprecated_statistics/TopPages';

import type { TopCustomEventsProps } from './TopCustomEvents';
import { TopCustomEvents } from './TopCustomEvents';
import type { VisitorsTrendProps } from './VisitorsTrend';
import { VisitorsTrend } from './VisitorsTrend';

export type PageviewsStatisticsProps = FiltersProps &
  AggregatedProps &
  PageviewsTrendProps &
  VisitorsTrendProps &
  HoursOfTheDayProps &
  TopPagesProps &
  TopCustomEventsProps;

export const PageviewsStatistics = ({
  pageViews,
  totalPageviews,
  topPages,
  topHours,
  topCustomEvents,
  mostPopularHour,
  uniqueVisitorsCount,
  pageVisitorsTrend,
  dateGte,
  dateLte,
  pathname,
}: PageviewsStatisticsProps) => {
  return (
    <Stack gap={1}>
      <Alert color='primary'>These Stats is deprecated. The old data will then be deleted sometime after January 15th 2024.</Alert>
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
      </Card>
    </Stack>
  );
};
