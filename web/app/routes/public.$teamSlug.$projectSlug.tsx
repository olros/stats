import { Container, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { PageviewsStatistics } from '~/components/pageviews';
import {
  formatFilterDate,
  getFilteringParams,
  getMostPopularHour,
  getPageViewsQuery,
  getPageViewsTrend,
  getTopCustomEvents,
  getTopCustomEventsQuery,
  getTopHours,
  getTopHoursQuery,
  getTopPages,
  getTopPagesQuery,
  getTotalPageviews,
  getUniqueVisitorsCount,
} from '~/components/pageviews/loaders';
import { prismaClient } from '~/prismaClient';
import { secondsToMilliseconds } from 'date-fns';
import { jsonHash } from 'remix-utils';
import invariant from 'tiny-invariant';
import { useInterval } from 'usehooks-ts';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');

  const project = await prismaClient.project.findFirst({
    where: {
      slug: params.projectSlug,
      teamSlug: params.teamSlug,
      public_statistics: true,
    },
    select: {
      name: true,
      team: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!project) {
    throw redirect('/');
  }

  const pageViewsQuery = getPageViewsQuery(request, params.teamSlug, params.projectSlug);
  const topPagesQuery = getTopPagesQuery(request, params.teamSlug, params.projectSlug);
  const topCustomEventsQuery = getTopCustomEventsQuery(request, params.teamSlug, params.projectSlug);
  const topHoursQuery = getTopHoursQuery(request, params.teamSlug, params.projectSlug);

  const { dateGte, dateLte, pathname } = getFilteringParams(request);

  return jsonHash({
    pageViews: await getPageViewsTrend(pageViewsQuery, dateGte, dateLte),
    totalPageviews: await getTotalPageviews(pageViewsQuery),
    topPages: await getTopPages(topPagesQuery),
    topCustomEvents: await getTopCustomEvents(topCustomEventsQuery),
    topHours: await getTopHours(topHoursQuery),
    mostPopularHour: await getMostPopularHour(topHoursQuery),
    uniqueVisitorsCount: await getUniqueVisitorsCount(request, params.teamSlug, params.projectSlug),
    dateGte: formatFilterDate(dateGte),
    dateLte: formatFilterDate(dateLte),
    pathname,
    project,
  });
};

export default function PublicPageviewsStatistics() {
  const { pageViews, totalPageviews, topPages, topCustomEvents, uniqueVisitorsCount, topHours, mostPopularHour, dateGte, dateLte, pathname, project } =
    useLoaderData<typeof loader>();

  const { revalidate } = useRevalidator();

  useInterval(() => {
    revalidate();
  }, secondsToMilliseconds(20));

  return (
    <Container sx={{ py: 2 }}>
      <Typography level='h1' sx={{ pb: 4 }} textAlign='center'>{`Stats for ${project.team.name}/${project.name}`}</Typography>
      <PageviewsStatistics
        dateGte={dateGte}
        dateLte={dateLte}
        mostPopularHour={mostPopularHour}
        pageViews={pageViews}
        pathname={pathname}
        topCustomEvents={topCustomEvents}
        topHours={topHours}
        topPages={topPages}
        totalPageviews={totalPageviews}
        uniqueVisitorsCount={uniqueVisitorsCount}
      />
    </Container>
  );
}
