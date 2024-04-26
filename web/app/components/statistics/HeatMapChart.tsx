import { lazy, Suspense } from 'react';
import { useInView } from 'react-intersection-observer';

import type { HeatMap } from './loader.server';

const ResponsiveHeatMap = lazy(() => import('~/components/lazy/ResponsiveHeatMap'));

export type HeatMapProps = {
  data: HeatMap[];
  disableUseInView?: boolean;
};

export const HeatMapChart = ({ data, disableUseInView = false }: HeatMapProps) => {
  const { ref, inView } = useInView({ rootMargin: '200px 0px', triggerOnce: true, skip: disableUseInView, initialInView: disableUseInView });
  return (
    <div className='relative h-[400px]' ref={ref}>
      {inView && (
        <Suspense fallback={null}>
          <ResponsiveHeatMap
            colors={{
              type: 'sequential',
              scheme: 'yellow_orange_red',
              minValue: 0,
            }}
            data={data}
            emptyColor='#171A1C'
            isInteractive={false}
            margin={{ top: 20, right: 0, bottom: 0, left: 25 }}
            theme={{
              legends: { text: { fill: '#F0F4F8' } },
              text: { fill: '#F0F4F8' },
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
