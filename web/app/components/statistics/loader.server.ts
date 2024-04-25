import type { SerializeFrom } from '@remix-run/node';
import { prismaClient } from '~/prismaClient';
import { format, setDay, subMinutes } from 'date-fns';

import { CURRENT_VISITORS_LAST_MINUTES, formatFilterDate, getFilteringParams, mapTrendDataToTrend } from './utils';

export type LoadStatistics = Awaited<ReturnType<typeof loadStatistics>>;
export type LoadStatisticsSerialized = Awaited<ReturnType<typeof loadStatistics>>;

export type Trend = {
  x: Date;
  y: number;
};
export type TrendSerialized = Trend;

export type TopData = {
  name: string | null;
  count: number;
};

export type TopGeoLocationData = TopData & {
  latitude: number;
  longitude: number;
};

export type HeatMap = {
  id: string;
  data: {
    x: string;
    y: number;
  }[];
};

export type LoadStatisticsProps = {
  request: Request;
  teamSlug: string;
  projectSlug: string;
};

export const loadStatistics = async ({ request, teamSlug, projectSlug }: LoadStatisticsProps) => {
  const { date, project, period } = await getWhereQuery({ request, teamSlug, projectSlug });

  const [
    currentVisitors,
    hoursOfWeekHeatMap,
    pageViewsTrend,
    topCustomEvents,
    topBrowsers,
    topGeoLocations,
    topDevices,
    topOS,
    topReferrers,
    topPages,
    totalPageViews,
    uniqueVisitorsTrend,
  ] = await Promise.all([
    getCurrentVisitors({ project }),
    getHoursOfWeekHeatMap({ project, date }),
    getPageViewsTrend({ date, project, period }),
    getTopCustomEvents({ date, project }),
    getTopBrowsers({ date, project }),
    getTopGeoLocations({ date, project }),
    getTopDevices({ date, project }),
    getTopOS({ date, project }),
    getTopReferrers({ date, project }),
    getTopPages({ date, project }),
    getTotalPageViews({ date, project }),
    getUniqueVisitorsTrend({ date, project, period }),
  ]);

  return {
    currentVisitors,
    date: { gte: formatFilterDate(date.gte), lte: formatFilterDate(date.lte) },
    hoursOfWeekHeatMap,
    pageViewsTrend,
    period,
    topCustomEvents,
    topBrowsers,
    topGeoLocations,
    topDevices,
    topOS,
    topReferrers,
    topPages,
    totalPageViews,
    uniqueVisitorsTrend,
  };
};

export type WhereQuery = Awaited<ReturnType<typeof getWhereQuery>>;

const getWhereQuery = async ({ request, teamSlug, projectSlug }: Pick<LoadStatisticsProps, 'teamSlug' | 'projectSlug' | 'request'>) => {
  const { dateGte, dateLte, period } = getFilteringParams(request);

  const project = await prismaClient.project.findFirstOrThrow({
    where: {
      slug: projectSlug.toLowerCase(),
      teamSlug: teamSlug.toLowerCase(),
    },
  });

  const date = { gte: dateGte, lte: dateLte } as const;

  return { date, project, period };
};

const getTotalPageViews = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<{ count: number }> => {
  return prismaClient.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
  `.then((rows) => rows[0]);
};

const getCurrentVisitors = async ({ project }: Pick<WhereQuery, 'project'>): Promise<{ count: number }> => {
  return prismaClient.$queryRaw<{ count: number }[]>`
    SELECT COUNT(DISTINCT p.user_hash)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date >= ${subMinutes(new Date(), CURRENT_VISITORS_LAST_MINUTES)};
  `.then((rows) => rows[0]);
};

const getPageViewsTrend = async ({ project, date, period }: Pick<WhereQuery, 'project' | 'date' | 'period'>): Promise<Trend[]> => {
  const rows = await prismaClient.$queryRaw<{ period: Date; count: number }[]>`
    SELECT DATE_TRUNC(${period}, p.date) as "period", COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY "period"
    ORDER BY "period" ASC;
  `;
  return mapTrendDataToTrend({ data: rows, period, date });
};

const getUniqueVisitorsTrend = async ({ project, date, period }: Pick<WhereQuery, 'project' | 'date' | 'period'>): Promise<Trend[]> => {
  const rows = await prismaClient.$queryRaw<{ period: Date; count: number }[]>`
    SELECT DATE_TRUNC(${period}, p.date) as "period", COUNT(DISTINCT p.user_hash)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY "period"
    ORDER BY "period" ASC;
  `;
  return mapTrendDataToTrend({ data: rows, period, date });
};

const getTopPages = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<TopData[]> => {
  return prismaClient.$queryRaw<TopData[]>`
    SELECT p.pathname as "name", COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY p.pathname
    ORDER BY "count" DESC
    LIMIT 50;
  `;
};

const getTopReferrers = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<TopData[]> => {
  return prismaClient.$queryRaw<TopData[]>`
    SELECT p.referrer as "name", COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY p.referrer
    ORDER BY "count" DESC
    LIMIT 50;
  `;
};

const getTopBrowsers = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<TopData[]> => {
  return prismaClient.$queryRaw<TopData[]>`
    SELECT p.browser as "name", COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY p.browser
    ORDER BY "count" DESC
    LIMIT 50;
  `;
};

const getTopOS = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<TopData[]> => {
  return prismaClient.$queryRaw<TopData[]>`
    SELECT p.os as "name", COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY p.os
    ORDER BY "count" DESC
    LIMIT 50;
  `;
};

const getTopDevices = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<TopData[]> => {
  return prismaClient.$queryRaw<TopData[]>`
    SELECT p.device as "name", COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY p.device
    ORDER BY "count" DESC
    LIMIT 50;
  `;
};

const getTopGeoLocations = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<TopGeoLocationData[]> => {
  return prismaClient.$queryRaw<TopGeoLocationData[]>`
    SELECT CONCAT(l.flag, ' ', l.city) as "name", l.latitude, l.longitude, COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    JOIN public."Location" l ON p."locationId" = l.id
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY l.id
    ORDER BY "count" DESC
    LIMIT 250;
  `;
};

const getHoursOfWeekHeatMap = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<HeatMap[]> => {
  const rows = await prismaClient.$queryRaw<{ day: number; hour: number; count: number }[]>`
    WITH weekHours AS (
      SELECT a AS "day", b AS "hour" FROM generate_series(0,6) a, generate_series(0,23) b
    ),
    projectPageViews AS (
      SELECT date FROM public."PageViewNext" p WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    )
    SELECT
      weekHours."day",
      weekHours."hour",
      COUNT(p.date)::int
    FROM weekHours 
    LEFT JOIN projectPageViews p ON "day" = EXTRACT(dow FROM p.date) AND "hour" = EXTRACT(hour FROM p.date)
    GROUP BY "day", "hour"
    ORDER BY "day", "hour";
  `;
  const heatMap: Record<number, HeatMap> = {};
  rows.forEach((row) => {
    if (!heatMap[row.hour]) {
      const data = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
        x: format(setDay(new Date(), day), 'eee'),
        y: rows.find((r) => r.hour === row.hour && r.day === day)?.count || 0,
      }));
      heatMap[row.hour] = { id: String(row.hour), data };
    }
  });
  return Object.values(heatMap);
};

const getTopCustomEvents = async ({ project, date }: Pick<WhereQuery, 'project' | 'date'>): Promise<TopData[]> => {
  return prismaClient.$queryRaw<TopData[]>`
    SELECT e.name, SUM(e.count)::int as "count"
    FROM public."CustomEvent" e
    WHERE e."projectId" = ${project.id} AND e.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY e.name
    ORDER BY "count" DESC
    LIMIT 50;
  `;
};
