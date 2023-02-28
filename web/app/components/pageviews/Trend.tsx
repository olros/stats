import { Box, Card, Typography, useTheme } from '@mui/joy';
import type { Serie } from '@nivo/line';
import { ResponsiveLine } from '@nivo/line';
import { Suspense } from 'react';

export type PageviewsTrendProps = {
  pageViews: Serie[];
  dateGte: string;
  dateLte: string;
};

export const PageviewsTrend = ({ pageViews, dateGte, dateLte }: PageviewsTrendProps) => {
  const theme = useTheme();
  return (
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
          data={pageViews}
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
          margin={{ top: 10, right: 120, bottom: 40, left: 30 }}
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
  );
};
