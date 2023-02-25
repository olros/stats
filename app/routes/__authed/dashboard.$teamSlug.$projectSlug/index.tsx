import { Box, Button, Card, Divider, FormControl, FormLabel, Input, Stack, Tooltip, Typography, useTheme } from '@mui/joy';
import type { Serie } from '@nivo/line';
import { ResponsiveLine } from '@nivo/line';
import type { LoaderArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import { addDays, format, isDate, set } from 'date-fns';
import { Fragment, Suspense, useMemo } from 'react';
import { jsonHash } from 'remix-utils';
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

  const pageViews = prismaClient.pageView.groupBy({
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

  const topPages = prismaClient.pageView.groupBy({
    by: ['pathname'],
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
              startsWith: pathname,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    _sum: { count: true },
    orderBy: { _sum: { count: 'desc' } },
    take: 20,
  });

  return jsonHash({ pageViews: await pageViews, topPages: await topPages, dateGte: formatDate(dateGte), dateLte: formatDate(dateLte), pathname });
};

export default function ProjectDashboard() {
  const { pageViews, topPages, dateGte, dateLte, pathname } = useLoaderData<typeof loader>();
  const theme = useTheme();
  const data: Serie[] = useMemo(
    () => [
      { id: 'Mobile devices', data: pageViews.map((item) => ({ x: item.date.substring(0, 10), y: item._sum.mobile_count })) },
      { id: 'Tablet devices', data: pageViews.map((item) => ({ x: item.date.substring(0, 10), y: item._sum.tablet_count })) },
      { id: 'Desktop devices', data: pageViews.map((item) => ({ x: item.date.substring(0, 10), y: item._sum.dekstop_count })) },
      { id: 'Total amount', data: pageViews.map((item) => ({ x: item.date.substring(0, 10), y: item._sum.count })) },
    ],
    [pageViews],
  );

  return (
    <Stack gap={1}>
      <Card>
        <Stack component={Form} direction={{ xs: 'column', md: 'row' }} gap={1}>
          <FormControl id='pathname' sx={{ flex: 1 }}>
            <Tooltip title='Equal-matching for Trend and startswith-matching for Top pages'>
              <FormLabel id='pathname-label'>Pathname</FormLabel>
            </Tooltip>
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
      <Card sx={{ p: 2 }}>
        <Typography gutterBottom level='h3'>
          Trend
        </Typography>
        <Suspense fallback={null}>
          <Box sx={{ position: 'relative', height: 400 }}>
            <ResponsiveLine
              axisBottom={{
                format: '%b %d',
                tickValues: 'every 2 days',
                tickRotation: -45,
              }}
              colors={{ scheme: 'paired' }}
              curve='monotoneX'
              data={data}
              enableSlices='x'
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
              margin={{ top: 10, right: 140, bottom: 40, left: 30 }}
              pointBorderColor={{ from: 'serieColor' }}
              pointBorderWidth={3}
              pointColor={{ theme: 'background' }}
              pointSize={3}
              sliceTooltip={({ slice }) => (
                <Card>
                  <Typography fontSize='md' fontWeight='bold'>
                    Pageviews:
                  </Typography>
                  {slice.points.map((point) => (
                    <Typography fontSize='sm' key={point.serieId}>
                      {point.serieId}: {point.data.yFormatted}
                    </Typography>
                  ))}
                </Card>
              )}
              theme={{
                textColor: theme.palette.text.primary,
                axis: {
                  domain: { line: { stroke: theme.palette.background.level1 } },
                },
                grid: {
                  line: { stroke: theme.palette.background.level1 },
                },
                tooltip: {
                  container: {
                    background: theme.palette.background.level2,
                    fill: theme.palette.text.primary,
                  },
                },
                legends: {
                  text: { fill: theme.palette.text.primary },
                },
              }}
              useMesh
              xFormat='time:%Y-%m-%d'
              xScale={{
                type: 'time',
                format: '%Y-%m-%d',
                useUTC: false,
                precision: 'day',
                min: dateGte,
                max: dateLte,
              }}
              yScale={{ type: 'linear' }}
            />
          </Box>
        </Suspense>
      </Card>
      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card>
          <Typography gutterBottom level='h3'>
            Top pages
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
            {topPages.map((page, i) => (
              <Fragment key={page.pathname}>
                <Typography sx={{ ml: 0.5 }}>{page.pathname}</Typography>
                <Typography sx={{ mr: 0.5, textAlign: 'right' }}>
                  {Intl.NumberFormat('en-GB', { notation: 'compact', compactDisplay: 'long', maximumFractionDigits: 1 }).format(page._sum.count || 0)}
                </Typography>
                {i !== topPages.length - 1 && <Divider sx={{ gridColumn: 'span 2', my: 0.25 }} />}
              </Fragment>
            ))}
          </Box>
        </Card>
        <Card>
          <Typography gutterBottom level='h3'>
            Custom events
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
            {/* {[].map((event, i) => (
              <Fragment key={event.name}>
                <Typography sx={{ ml: 0.5 }}>{event.name}</Typography>
                <Typography sx={{ mr: 0.5, textAlign: 'right' }}>
                  {Intl.NumberFormat('en-GB', { notation: 'compact', compactDisplay: 'long', maximumFractionDigits: 1 }).format(event._sum.count || 0)}
                </Typography>
                {i !== [].length - 1 && <Divider sx={{ gridColumn: 'span 2', my: 0.25 }} />}
              </Fragment>
            ))} */}
          </Box>
        </Card>
      </Box>
    </Stack>
  );
}
