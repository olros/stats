import type { BarDatum } from '@nivo/bar';
import type { Serie } from '@nivo/line';
import type { PageView, Prisma } from '@prisma/client';
import { prismaClient } from '~/prismaClient';
import { addDays, format, isDate, set } from 'date-fns';

import type { Hour } from './HoursOfTheDay';

const getDateFromSearchParam = (param: string | null) => {
  if (!param) return undefined;
  const date = new Date(param);
  if (!isDate(date)) return undefined;
  return date;
};

const getRequestSearchparams = (request: Request) => new URL(request.url).searchParams;

export const formatFilterDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const getFilteringParams = (request: Request) => {
  const searchParams = getRequestSearchparams(request);
  const defaultDate = set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
  const dateGte = getDateFromSearchParam(searchParams.get('gte')) || addDays(defaultDate, -30);
  const dateLte = getDateFromSearchParam(searchParams.get('lte')) || defaultDate;
  const pathname = searchParams.get('pathname') || '';

  return { dateGte, dateLte, pathname };
};

export const getWhereQuery = (request: Request, teamSlug: string, projectSlug: string) => {
  const { dateGte, dateLte, pathname } = getFilteringParams(request);

  const project = {
    slug: projectSlug.toLowerCase(),
    teamSlug: teamSlug.toLowerCase(),
  };
  const date: string | Date | Prisma.DateTimeFilter | undefined = {
    gte: dateGte,
    lte: dateLte,
  };
  const pathnameFilter: Prisma.StringFilter | undefined =
    pathname.length > 0
      ? {
          equals: pathname,
          mode: 'insensitive',
        }
      : undefined;

  return { date, project, pathname: pathnameFilter };
};

export const getPageViewsQuery = (request: Request, teamSlug: string, projectSlug: string) => {
  const { date, project, pathname } = getWhereQuery(request, teamSlug, projectSlug);
  return prismaClient.pageView.groupBy({
    by: ['date'],
    where: { date, project, pathname },
    _sum: { count: true, dekstop_count: true, mobile_count: true, tablet_count: true },
    orderBy: { date: 'asc' },
  });
};

export const getPageViewsTrend = (pageViewsQuery: ReturnType<typeof getPageViewsQuery>): Promise<Serie[]> =>
  pageViewsQuery.then((data) => [
    { id: 'Mobile devices', data: data.map((item) => ({ x: item.date.toJSON().substring(0, 10), y: item._sum.mobile_count || 0 })) },
    { id: 'Tablet devices', data: data.map((item) => ({ x: item.date.toJSON().substring(0, 10), y: item._sum.tablet_count || 0 })) },
    { id: 'Desktop devices', data: data.map((item) => ({ x: item.date.toJSON().substring(0, 10), y: item._sum.dekstop_count || 0 })) },
    { id: 'Total amount', data: data.map((item) => ({ x: item.date.toJSON().substring(0, 10), y: item._sum.count || 0 })) },
  ]);

export const getTotalPageviews = (pageViewsQuery: ReturnType<typeof getPageViewsQuery>): Promise<number> =>
  pageViewsQuery.then((data) => data.reduce((prev, cur) => prev + (cur._sum.count || 0), 0));

export const getTopPagesQuery = (request: Request, teamSlug: string, projectSlug: string) => {
  const { date, project, pathname } = getWhereQuery(request, teamSlug, projectSlug);
  return prismaClient.pageView.groupBy({
    by: ['pathname'],
    where: { date, project, pathname },
    _sum: { count: true },
    orderBy: { _sum: { count: 'desc' } },
    take: 20,
  });
};

export const getTopPages = (topPagesQuery: ReturnType<typeof getTopPagesQuery>) =>
  topPagesQuery.then((data) => data.map<Pick<PageView, 'pathname' | 'count'>>((page) => ({ pathname: page.pathname, count: page._sum.count || 0 })));

export const getTopHoursQuery = (request: Request, teamSlug: string, projectSlug: string) => {
  const { date, project, pathname } = getWhereQuery(request, teamSlug, projectSlug);

  return prismaClient.pageView.groupBy({
    by: ['hour'],
    where: { date, project, pathname },
    _sum: { count: true },
    orderBy: { hour: 'asc' },
  });
};

export const getTopHours = (topHoursQuery: ReturnType<typeof getTopHoursQuery>) =>
  topHoursQuery.then((data) => {
    const totalCount = data.reduce((prev, cur) => prev + (cur._sum.count || 0), 0);
    return Array(24)
      .fill(0)
      .map((_, i) => {
        const count = data.find((hour) => hour.hour === i)?._sum.count || 0;
        const percentage = Number(((count / totalCount) * 100).toFixed(1));
        return { hour: String(i).padStart(2, '0'), percentage, label: percentage > 0 ? `${percentage}% (${count})` : '0' } satisfies Hour;
      })
      .reverse() satisfies BarDatum[];
  });

export const getMostPopularHour = (topHoursQuery: ReturnType<typeof getTopHoursQuery>) =>
  getTopHours(topHoursQuery).then((data) => [...data].sort((a, b) => b.percentage - a.percentage)[0]);

export const getUniqueVisitorsCount = async (request: Request, teamSlug: string, projectSlug: string) => {
  const { date, project } = getWhereQuery(request, teamSlug, projectSlug);
  const uniqueVisitors = await prismaClient.pageVisitor.groupBy({
    by: ['hashed_user_id'],
    where: { date, project },
    orderBy: { hashed_user_id: 'asc' },
  });
  return uniqueVisitors.length;
};
