import { Box, Divider, Typography } from '@mui/joy';
import { Fragment } from 'react';

import type { getTopCustomEvents } from './loaders';

export type TopCustomEventsProps = {
  topCustomEvents: Awaited<ReturnType<typeof getTopCustomEvents>>;
};

export const TopCustomEvents = ({ topCustomEvents }: TopCustomEventsProps) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 0.5 }}>
      {topCustomEvents.map((customEvent, i) => (
        <Fragment key={customEvent.name}>
          <Typography sx={{ ml: 0.5, overflowWrap: 'anywhere' }}>{customEvent.name}</Typography>
          <Typography sx={{ mr: 0.5, textAlign: 'right' }}>
            {Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(customEvent.count)}
          </Typography>
          {i !== topCustomEvents.length - 1 && <Divider sx={{ gridColumn: 'span 2', my: 0.25 }} />}
        </Fragment>
      ))}
    </Box>
  );
};
