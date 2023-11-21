import { AspectRatio, Card, CardContent, Typography } from '@mui/joy';

export type AggregatedCardProps = {
  emoji: string;
  title: string;
  count: number;
};

export const AggregatedCard = ({ count, emoji, title }: AggregatedCardProps) => {
  return (
    <Card orientation='horizontal' sx={{ flex: 1, alignItems: 'center' }}>
      <AspectRatio ratio='1' sx={{ width: 55, height: 55, background: 'transparent' }}>
        <Typography fontSize='xl'>{emoji}</Typography>
      </AspectRatio>
      <CardContent sx={{ gap: 0.25 }}>
        <Typography level='body-md'>{title}</Typography>
        <Typography fontSize='xl' fontWeight='bold'>
          {Intl.NumberFormat('en-GB', { notation: 'compact' }).format(count)}
        </Typography>
      </CardContent>
    </Card>
  );
};
