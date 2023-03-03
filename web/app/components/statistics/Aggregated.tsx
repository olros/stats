import { AspectRatio, Card, CardContent, Stack, Typography } from '@mui/joy';

import type { getMostPopularHour, getTotalPageviews, getUniqueVisitorsCount } from './loaders';

export type AggregatedProps = {
  totalPageviews: Awaited<ReturnType<typeof getTotalPageviews>>;
  mostPopularHour: Awaited<ReturnType<typeof getMostPopularHour>>;
  uniqueVisitorsCount: Awaited<ReturnType<typeof getUniqueVisitorsCount>>;
};

export const Aggregated = ({ totalPageviews, mostPopularHour, uniqueVisitorsCount }: AggregatedProps) => {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
      <Card orientation='horizontal' sx={{ flex: 1 }}>
        <AspectRatio ratio='1' sx={{ width: 55, background: 'transparent' }}>
          <Typography fontSize='xl'>👀</Typography>
        </AspectRatio>
        <CardContent sx={{ px: 2, gap: 0.25 }}>
          <Typography level='body2'>Pageviews</Typography>
          <Typography fontSize='xl' fontWeight='bold'>
            {Intl.NumberFormat('en-GB', { notation: 'compact' }).format(totalPageviews)}
          </Typography>
        </CardContent>
      </Card>
      <Card orientation='horizontal' sx={{ flex: 1 }}>
        <AspectRatio ratio='1' sx={{ width: 55, background: 'transparent' }}>
          <Typography fontSize='xl'>🧑</Typography>
        </AspectRatio>
        <CardContent sx={{ px: 2, gap: 0.25 }}>
          <Typography level='body2'>Unique visitors</Typography>
          <Typography fontSize='xl' fontWeight='bold'>
            {Intl.NumberFormat('en-GB', { notation: 'compact' }).format(uniqueVisitorsCount)}
          </Typography>
        </CardContent>
      </Card>
      <Card orientation='horizontal' sx={{ flex: 1 }}>
        <AspectRatio ratio='1' sx={{ width: 55, background: 'transparent' }}>
          <Typography fontSize='xl'>🕓</Typography>
        </AspectRatio>
        <CardContent sx={{ px: 2, gap: 0.25 }}>
          <Typography level='body2'>Most popular hour</Typography>
          <Typography fontSize='xl' fontWeight='bold'>
            {`${mostPopularHour.hour}-${String(Number(mostPopularHour.hour) + 1).padStart(2, '0')} (${mostPopularHour.percentage}%)`}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};
