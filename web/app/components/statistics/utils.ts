import { addDays, eachDayOfInterval, eachHourOfInterval, endOfDay, format, isDate, isSameDay, isSameHour, set, startOfDay } from 'date-fns';

import type { Trend, WhereQuery } from './loader.server';

/** Number of minutes backwards that should count towards current visitors */
export const CURRENT_VISITORS_LAST_MINUTES = 5;

export const formatFilterDate = (date: Date) => format(date, 'yyyy-MM-dd');

const getDateFromSearchParam = (param: string | null) => {
  if (!param) return undefined;
  const date = new Date(param);
  if (!isDate(date)) return undefined;
  return date;
};

const PERIOD_TYPES = ['day', 'hour'] as const;
export type PERIOD = (typeof PERIOD_TYPES)[number];

export const getFilteringParams = (request: Request) => {
  const searchParams = new URL(request.url).searchParams;
  const rawPeriod = searchParams.get('period');
  const period: PERIOD = (rawPeriod && PERIOD_TYPES.includes(rawPeriod as PERIOD) ? rawPeriod : 'day') as PERIOD;

  const defaultGte = new Date();
  const dateGte = startOfDay(getDateFromSearchParam(searchParams.get('gte')) || addDays(defaultGte, -30));
  const dateLte = endOfDay(getDateFromSearchParam(searchParams.get('lte')) || defaultGte);

  return { dateGte, dateLte, period };
};

export const mapTrendDataToTrend = async ({
  data,
  period,
  date,
}: { data: { period: Date; count: number }[] } & Pick<WhereQuery, 'date' | 'period'>): Promise<Trend[]> => {
  if (period === 'day') {
    const days = eachDayOfInterval({ start: date.gte, end: date.lte }).map((day) => set(day, { hours: 12 }));
    return days.map((day) => ({ x: day, y: data.find((point) => isSameDay(point.period, day))?.count || 0 }));
  }
  const hours = eachHourOfInterval({ start: date.gte, end: date.lte });
  return hours.map((hour) => ({ x: hour, y: data.find((point) => isSameHour(point.period, hour))?.count || 0 }));
};
