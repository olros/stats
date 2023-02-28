import { AspectRatio, Card, CardContent, Stack, Typography } from '@mui/joy';

import type { Hour } from './HoursOfTheDay';

export type AggregatedProps = {
  totalPageviews: number;
  mostPopularHour: Hour;
};

export const Aggregated = ({ totalPageviews, mostPopularHour }: AggregatedProps) => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
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
