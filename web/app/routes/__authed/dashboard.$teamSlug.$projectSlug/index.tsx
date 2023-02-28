import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { PageviewsStatistics } from '~/components/pageviews';
import {
  formatFilterDate,
  getFilteringParams,
  getMostPopularHour,
  getPageViewsQuery,
  getPageViewsTrend,
  getTopHours,
  getTopHoursQuery,
  getTopPages,
  getTopPagesQuery,
  getTotalPageviews,
} from '~/components/pageviews/loaders';
import { secondsToMilliseconds } from 'date-fns';
import { jsonHash } from 'remix-utils';
import invariant from 'tiny-invariant';
import { useInterval } from 'usehooks-ts';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);

  const pageViewsQuery = getPageViewsQuery(request, params.teamSlug, params.projectSlug);
  const topPagesQuery = getTopPagesQuery(request, params.teamSlug, params.projectSlug);
  const topHoursQuery = getTopHoursQuery(request, params.teamSlug, params.projectSlug);

  const { dateGte, dateLte, pathname } = getFilteringParams(request);

  return jsonHash({
    pageViews: await getPageViewsTrend(pageViewsQuery),
    totalPageviews: await getTotalPageviews(pageViewsQuery),
    topPages: await getTopPages(topPagesQuery),
    topHours: await getTopHours(topHoursQuery),
    mostPopularHour: await getMostPopularHour(topHoursQuery),
    dateGte: formatFilterDate(dateGte),
    dateLte: formatFilterDate(dateLte),
    pathname,
  });
};

export default function ProjectDashboard() {
  const { pageViews, totalPageviews, topPages, topHours, mostPopularHour, dateGte, dateLte, pathname } = useLoaderData<typeof loader>();

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
      pathname={pathname}
      topHours={topHours}
      topPages={topPages}
      totalPageviews={totalPageviews}
    />
  );
}
