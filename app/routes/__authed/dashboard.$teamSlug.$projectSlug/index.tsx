import { Box, Button, Card, FormControl, FormLabel, Input, Stack, Typography } from '@mui/joy';
import { PageView } from '@prisma/client';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { addDays, format, isDate, set } from 'date-fns';
import { useMemo } from 'react';
import type { AxisOptions, UserSerie } from 'react-charts';
import { Chart } from 'react-charts';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

const getDateFromSearchParam = (param: string | null) => {
  if (!param) return undefined;
  const date = new Date(param);
  if (!isDate(date)) return undefined;
  return date;
};

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);

  const searchParams = new URL(request.url).searchParams;

  const defaultDate = set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
  const dateGte = getDateFromSearchParam(searchParams.get('gte')) || addDays(defaultDate, -30);
  const dateLte = getDateFromSearchParam(searchParams.get('lte')) || defaultDate;

  const pathname = searchParams.get('pathname') || '';

  const pageViews = await prismaClient.pageView.groupBy({
    by: ['date'],
    where: {
      project: {
        slug: params.projectSlug.toLowerCase(),
        teamSlug: params.teamSlug.toLowerCase(),
      },
      date: {
        gte: dateGte,
        lte: dateLte,
      },
      ...(pathname.length
        ? {
            pathname: {
              equals: pathname,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    _sum: { count: true, dekstop_count: true, mobile_count: true, tablet_count: true },
    orderBy: { date: 'asc' },
  });

  return json({ pageViews, dateGte: formatDate(dateGte), dateLte: formatDate(dateLte), pathname });
};

type PageViewData = {
  date: Date;
  count: number;
};

export default function ProjectDashboard() {
  const { pageViews, dateGte, dateLte, pathname } = useLoaderData<typeof loader>();
  const primaryAxis = useMemo<AxisOptions<PageViewData>>(
    () => ({ getValue: (datum) => datum.date, scaleType: 'time', hardMin: new Date(dateGte), hardMax: new Date(dateLte) }),
    [dateGte, dateLte],
  );
  const secondaryAxes = useMemo<AxisOptions<PageViewData>[]>(
    () => [{ getValue: (datum) => datum.count, elementType: 'line', hardMin: 0, hardMax: Math.max(...pageViews.map((p) => p._sum.count || 0)) * 1.1 }],
    [pageViews],
  );

  const data: UserSerie<PageViewData>[] = [
    { label: 'Total amount', data: pageViews.map((item) => ({ date: new Date(item.date), count: item._sum.count || 0 })) },
    { label: 'Mobile device', data: pageViews.map((item) => ({ date: new Date(item.date), count: item._sum.mobile_count || 0 })) },
  ];
  return (
    <Stack gap={1}>
      <Card>
        <Stack component={Form} direction={{ xs: 'column', md: 'row' }} gap={1}>
          <FormControl id='pathname' sx={{ flex: 1 }}>
            <FormLabel id='pathname-label'>Pathname</FormLabel>
            <Input defaultValue={pathname} name='pathname' />
          </FormControl>
          <FormControl id='gte' required sx={{ flex: 1 }}>
            <FormLabel id='gte-label'>From date</FormLabel>
            <Input defaultValue={dateGte} name='gte' type='date' />
          </FormControl>
          <FormControl id='lte' required sx={{ flex: 1 }}>
            <FormLabel id='lte-label'>To date</FormLabel>
            <Input defaultValue={dateLte} name='lte' type='date' />
          </FormControl>
          <Button sx={{ height: 40, mt: 'auto' }} type='submit'>
            Oppdater
          </Button>
        </Stack>
      </Card>
      <Card sx={{ position: 'relative', p: 1 }}>
        <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
              dark: true,
              tooltip: false,
              initialHeight: 400,
            }}
          />
        </Box>
      </Card>
    </Stack>
  );
}
