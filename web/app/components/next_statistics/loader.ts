import { prismaClient } from '~/prismaClient';
import { addDays, endOfDay, isDate, startOfDay } from 'date-fns';

export type LoadStatistics = {
  request: Request;
  teamSlug: string;
  projectSlug: string;
};

export const loadStatistics = async ({ request, teamSlug, projectSlug }: LoadStatistics) => {
  const { date, project, period } = await getWhereQuery({ request, teamSlug, projectSlug });

  const [hoursOfWeekHeatMap, pageViewsTrend, uniqueUsersTrend, topPages] = await Promise.all([
    getHoursOfWeekHeatMap({ project }),
    getPageViewsTrend({ date, project, period }),
    getUniqueUsersTrend({ date, project, period }),
    getTopPages({ date, project }),
  ]);

  return { period, date, hoursOfWeekHeatMap, pageViewsTrend, uniqueUsersTrend, topPages };
};

const getDateFromSearchParam = (param: string | null) => {
  if (!param) return undefined;
  const date = new Date(param);
  if (!isDate(date)) return undefined;
  return date;
};

const PERIOD_TYPES = ['day', 'hour'] as const;
type PERIOD = (typeof PERIOD_TYPES)[number];

const getFilteringParams = (request: Request) => {
  const searchParams = new URL(request.url).searchParams;
  const rawPeriod = searchParams.get('period');
  const period: PERIOD = (rawPeriod && PERIOD_TYPES.includes(rawPeriod as PERIOD) ? rawPeriod : 'day') as PERIOD;

  const defaultGte = new Date();
  const dateGte = startOfDay(getDateFromSearchParam(searchParams.get('gte')) || addDays(defaultGte, -30));
  const dateLte = endOfDay(getDateFromSearchParam(searchParams.get('lte')) || defaultGte);

  return { dateGte, dateLte, period };
};

type WhereQuery = Awaited<ReturnType<typeof getWhereQuery>>;

const getWhereQuery = async ({ request, teamSlug, projectSlug }: Pick<LoadStatistics, 'teamSlug' | 'projectSlug' | 'request'>) => {
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

const getPageViewsTrend = ({ project, date, period }: Pick<WhereQuery, 'project' | 'date' | 'period'>) => {
  return prismaClient.$queryRaw<{ period: Date; count: number }>`
    SELECT DATE_TRUNC(${period}, p.date) as "period", COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY "period"
    ORDER BY "period" ASC;
  `;
};

const getUniqueUsersTrend = ({ project, date, period }: Pick<WhereQuery, 'project' | 'date' | 'period'>) => {
  return prismaClient.$queryRaw<{ period: Date; count: number }>`
    SELECT DATE_TRUNC(${period}, p.date) as "period", COUNT(DISTINCT p.user_hash)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY "period"
    ORDER BY "period" ASC;
  `;
};

const getTopPages = ({ project, date }: Pick<WhereQuery, 'project' | 'date'>) => {
  return prismaClient.$queryRaw<{ pathname: string; count: number }>`
    SELECT p.pathname, COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    WHERE p."projectId" = ${project.id} AND p.date BETWEEN ${date.gte} AND ${date.lte}
    GROUP BY p.pathname
    ORDER BY "count" DESC;
  `;
};

const getHoursOfWeekHeatMap = ({ project }: Pick<WhereQuery, 'project'>) => {
  return prismaClient.$queryRaw<{ day: number; hour: number; count: number }>`
    WITH weekHours AS (
      SELECT a AS "day", b AS "hour" FROM generate_series(0,6) a, generate_series(0,23) b
    ),
    projectPageViews AS (
      SELECT date FROM public."PageViewNext" WHERE "projectId" = ${project.id}
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
};
