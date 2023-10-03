import { Container, Typography } from '@mui/joy';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import type { LoaderArgs, V2_MetaFunction } from '@vercel/remix';
import { redirect } from '@vercel/remix';
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
import { prismaClient } from '~/prismaClient';
import { secondsToMilliseconds } from 'date-fns';
import { jsonHash } from 'remix-utils';
import invariant from 'tiny-invariant';
import { useInterval } from 'usehooks-ts';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.project.team.name}/${data?.project.name} | Stats` }];

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
  const pageVisitorsQuery = getPageVisitorsQuery(request, params.teamSlug, params.projectSlug);

  const { dateGte, dateLte, pathname } = getFilteringParams(request);

  try {
    return jsonHash({
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
      project,
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
    project,
  } = useLoaderData<typeof loader>();

  const { revalidate } = useRevalidator();

  useInterval(() => {
    revalidate();
  }, secondsToMilliseconds(20));

  return (
    <Container sx={{ py: 2 }}>
      <Typography level='h1' sx={{ pb: 4, wordBreak: 'break-word' }} textAlign='center'>{`Stats for ${project.team.name}/${project.name}`}</Typography>
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
      <Typography component='a' href='https://github.com/olros/stats' sx={{ textAlign: 'center', my: 2 }} target='_blank'>
        @olros/stats
      </Typography>
    </Container>
  );
}
