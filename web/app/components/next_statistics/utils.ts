import { addDays, endOfDay, format, isDate, startOfDay } from 'date-fns';

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
type PERIOD = (typeof PERIOD_TYPES)[number];

export const getFilteringParams = (request: Request) => {
  const searchParams = new URL(request.url).searchParams;
  const rawPeriod = searchParams.get('period');
  const period: PERIOD = (rawPeriod && PERIOD_TYPES.includes(rawPeriod as PERIOD) ? rawPeriod : 'day') as PERIOD;

  const defaultGte = new Date();
  const dateGte = startOfDay(getDateFromSearchParam(searchParams.get('gte')) || addDays(defaultGte, -30));
  const dateLte = endOfDay(getDateFromSearchParam(searchParams.get('lte')) || defaultGte);

  return { dateGte, dateLte, period };
};
