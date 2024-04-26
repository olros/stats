import { Fragment } from 'react';

import type { TopData } from './loader.server';
import { Typography } from '../typography';
import { cn } from '~/lib/utils';

export type BarChartProps = {
  data: TopData[];
  maxCount?: number;
  title: string;
  countTitle: string;
  nullText?: string;
};

export const BarChart = ({ data, maxCount, title, countTitle, nullText }: BarChartProps) => {
  const gridTemplateColumns = maxCount ? 'grid-cols-[1fr__4.5rem_4.5rem]' : 'grid-cols-[1fr__4.5rem]';
  if (data.length === 0) {
    return <Typography>Found none registered with the current filters</Typography>;
  }
  return (
    <div>
      <div className={cn('grid gap-2 my-2', gridTemplateColumns)}>
        <Typography variant='small'>{title}</Typography>
        <Typography variant='small' className='text-right'>
          {countTitle}
        </Typography>
        {maxCount !== undefined && (
          <Typography variant='small' className='text-right'>
            %
          </Typography>
        )}
      </div>
      <div className={cn('grid gap-2 gap-y-1 gap-x-2 max-h-[400px] overflow-auto', gridTemplateColumns)}>
        {data.map((row) => (
          <Fragment key={row.name}>
            <div className='h-full w-full relative'>
              <div className={`h-full absolute left-0 top-0 bottom-0 rounded bg-secondary`} style={{ width: `${(row.count / data[0].count) * 100}%` }} />
              <Typography className='!mt-0 py-1 px-2 relative z-[2] break-words'>{decodeURIComponent(row.name || nullText || '')}</Typography>
            </div>
            <Typography className='!mt-0 py-1 text-right'>
              {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(row.count)}
            </Typography>
            {maxCount !== undefined && (
              <Typography className='!mt-0 py-1 text-right'>
                {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format((row.count / maxCount) * 100)}
              </Typography>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
