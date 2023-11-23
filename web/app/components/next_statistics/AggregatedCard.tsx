import { AspectRatio, Card, CardContent, Tooltip, Typography } from '@mui/joy';

export type AggregatedCardProps = {
  emoji: string;
  title: string;
  count: number;
  tooltip?: string;
};

export const AggregatedCard = ({ count, emoji, title, tooltip }: AggregatedCardProps) => {
  return (
    <Card orientation='horizontal' sx={{ flex: 1, alignItems: 'center' }}>
      <AspectRatio ratio='1' sx={{ width: 55, height: 55, background: 'transparent' }}>
        <Typography fontSize='xl'>{emoji}</Typography>
      </AspectRatio>
      <CardContent sx={{ gap: 0.25 }}>
        <Typography level='body-md'>
          {tooltip ? (
            <Tooltip arrow color='primary' sx={{ maxWidth: 300 }} title={tooltip} variant='outlined'>
              <span>{title}</span>
            </Tooltip>
          ) : (
            title
          )}
        </Typography>
        <Typography fontSize='xl' fontWeight='bold'>
          {Intl.NumberFormat('en-GB', { notation: 'compact' }).format(count)}
        </Typography>
      </CardContent>
    </Card>
  );
};
