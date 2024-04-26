import { Typography } from '../typography';
import { Card, CardContent } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export type AggregatedCardProps = {
  emoji: string;
  title: string;
  count: number;
  tooltip?: string;
};

export const AggregatedCard = ({ count, emoji, title, tooltip }: AggregatedCardProps) => {
  return (
    <Card className='flex flex-1 items-center gap-4'>
      <div className='bg-secondary flex aspect-square h-14 w-14 items-center justify-center rounded-sm'>
        <Typography variant='large'>{emoji}</Typography>
      </div>
      <CardContent className='flex flex-col p-0'>
        <Typography variant='small'>
          {tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>{title}</TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            title
          )}
        </Typography>
        <Typography variant='large'>{Intl.NumberFormat('en-GB', { notation: 'compact' }).format(count)}</Typography>
      </CardContent>
    </Card>
  );
};
