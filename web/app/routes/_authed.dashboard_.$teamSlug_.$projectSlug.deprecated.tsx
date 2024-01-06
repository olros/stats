import { useLoaderData, useRevalidator } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { PageviewsStatistics } from '~/components/deprecated_statistics';
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
} from '~/components/deprecated_statistics/loaders';
import { useInterval } from '~/hooks/useInterval';
import { secondsToMilliseconds } from 'date-fns';
import { jsonHash } from 'remix-utils/json-hash';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);

  const pageViewsQuery = getPageViewsQuery(request, params.teamSlug, params.projectSlug);
  const topPagesQuery = getTopPagesQuery(request, params.teamSlug, params.projectSlug);
  const topCustomEventsQuery = getTopCustomEventsQuery(request, params.teamSlug, params.projectSlug);
  const topHoursQuery = getTopHoursQuery(request, params.teamSlug, params.projectSlug);
  const pageVisitorsQuery = getPageVisitorsQuery(request, params.teamSlug, params.projectSlug);

  const { dateGte, dateLte, pathname } = getFilteringParams(request);

  return jsonHash({
    pageViews: getPageViewsTrend(pageViewsQuery, dateGte, dateLte),
    totalPageviews: getTotalPageviews(pageViewsQuery),
    topPages: getTopPages(topPagesQuery),
    topCustomEvents: getTopCustomEvents(topCustomEventsQuery),
    topHours: getTopHours(topHoursQuery),
    mostPopularHour: getMostPopularHour(topHoursQuery),
    pageVisitorsTrend: getPageVisitorsTrend(pageVisitorsQuery, dateGte, dateLte),
    uniqueVisitorsCount: getUniqueVisitorsCount(request, params.teamSlug, params.projectSlug),
    dateGte: formatFilterDate(dateGte),
    dateLte: formatFilterDate(dateLte),
    pathname,
  });
};

export default function ProjectPageviewsStatistics() {
  const {
    pageViews,
    totalPageviews,
    topPages,
    topCustomEvents,
    topHours,
    mostPopularHour,
    pageVisitorsTrend,
    uniqueVisitorsCount,
    dateGte,
    dateLte,
    pathname,
  } = useLoaderData<typeof loader>();

  const { revalidate } = useRevalidator();

  useInterval(() => {
    revalidate();
  }, secondsToMilliseconds(20));

  return (
    <PageviewsStatistics
      dateGte={dateGte}
      dateLte={dateLte}
      mostPopularHour={mostPopularHour}
      pageViews={pageViews}
      pageVisitorsTrend={pageVisitorsTrend}
      pathname={pathname}
      topCustomEvents={topCustomEvents}
      topHours={topHours}
      topPages={topPages}
      totalPageviews={totalPageviews}
      uniqueVisitorsCount={uniqueVisitorsCount}
    />
  );
}
