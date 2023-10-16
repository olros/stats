import { Typography } from '@mui/joy';
import { Await, useLoaderData, useRevalidator } from '@remix-run/react';
import { defer, type LoaderFunctionArgs } from '@vercel/remix';
import { PageviewsStatistics } from '~/components/statistics';
import {
  formatFilterDate,
  getFilteringParams,
  getMostPopularHour,
  getPageViewsQuery,
  getPageViewsTrend,
  getPageVisitorsQuery,
  getPageVisitorsTrend,
  getTopCustomEvents,
  getTopCustomEventsQuery,
  getTopHours,
  getTopHoursQuery,
  getTopPages,
  getTopPagesQuery,
  getTotalPageviews,
  getUniqueVisitorsCount,
} from '~/components/statistics/loaders';
import { secondsToMilliseconds } from 'date-fns';
import { Suspense } from 'react';
import invariant from 'tiny-invariant';
import { useInterval } from '~/hooks/useInterval';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');

  const pageViewsQuery = getPageViewsQuery(request, params.teamSlug, params.projectSlug);
  const topPagesQuery = getTopPagesQuery(request, params.teamSlug, params.projectSlug);
  const topCustomEventsQuery = getTopCustomEventsQuery(request, params.teamSlug, params.projectSlug);
  const topHoursQuery = getTopHoursQuery(request, params.teamSlug, params.projectSlug);
  const pageVisitorsQuery = getPageVisitorsQuery(request, params.teamSlug, params.projectSlug);

  const { dateGte, dateLte, pathname } = getFilteringParams(request);

  try {
    return defer({
      pageViews: getPageViewsTrend(pageViewsQuery, dateGte, dateLte),
      totalPageviews: getTotalPageviews(pageViewsQuery),
      topPages: getTopPages(topPagesQuery),
      topCustomEvents: getTopCustomEvents(topCustomEventsQuery),
      topHours: getTopHours(topHoursQuery),
      mostPopularHour: getMostPopularHour(topHoursQuery),
      uniqueVisitorsCount: getUniqueVisitorsCount(request, params.teamSlug, params.projectSlug),
      pageVisitorsTrend: getPageVisitorsTrend(pageVisitorsQuery, dateGte, dateLte),
      dateGte: formatFilterDate(dateGte),
      dateLte: formatFilterDate(dateLte),
      pathname,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default function PublicPageviewsStatistics() {
  const {
    pageViews,
    totalPageviews,
    topPages,
    topCustomEvents,
    uniqueVisitorsCount,
    topHours,
    mostPopularHour,
    pageVisitorsTrend,
    dateGte,
    dateLte,
    pathname,
  } = useLoaderData<typeof loader>();

  const { revalidate } = useRevalidator();

  useInterval(() => {
    revalidate();
  }, secondsToMilliseconds(20));

  return (
    <Suspense fallback={<Typography>Loading...</Typography>}>
      <Await resolve={Promise.all([pageViews, mostPopularHour, pageVisitorsTrend, topCustomEvents, topHours, topPages, totalPageviews, uniqueVisitorsCount])}>
        {([pageViews, mostPopularHour, pageVisitorsTrend, topCustomEvents, topHours, topPages, totalPageviews, uniqueVisitorsCount]) => (
          <PageviewsStatistics
            dateGte={dateGte}
            dateLte={dateLte}
            mostPopularHour={mostPopularHour}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            pageViews={pageViews}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            pageVisitorsTrend={pageVisitorsTrend}
            pathname={pathname}
            topCustomEvents={topCustomEvents}
            topHours={topHours}
            topPages={topPages}
            totalPageviews={totalPageviews}
            uniqueVisitorsCount={uniqueVisitorsCount}
          />
        )}
      </Await>
    </Suspense>
  );
}
