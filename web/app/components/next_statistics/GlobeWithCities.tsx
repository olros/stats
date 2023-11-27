/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, useTheme } from '@mui/joy';
import { useElementSize } from '~/hooks/useElementSize';
import { scaleSequentialSqrt } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef } from 'react';

import type { TopGeoLocationData } from './loader.server';

const Globe = lazy(() => import('~/components/lazy/Globe'));

export type GlobeWithCitiesProps = {
  data: TopGeoLocationData[];
  ringsData?: { lat: number; lng: number }[];
  height?: number;
};

const ringsColorInterpolator = (t: number) => `rgba(255,255,255,${Math.sqrt(1 - t)})`;

const MAX_ALTITUDE = 0.6;
const MIN_ALTITUDE = 0.01;

const weightColor = scaleSequentialSqrt(interpolateYlOrRd).domain([MIN_ALTITUDE, MAX_ALTITUDE]);

const countToAltitude = (count: number, maxCount: number) => Math.min(MAX_ALTITUDE, Math.max(MIN_ALTITUDE, (count / (maxCount * 0.75)) * MAX_ALTITUDE));

export const GlobeWithCities = memo(({ data, ringsData = [], height = 400 }: GlobeWithCitiesProps) => {
  const { palette } = useTheme();
  const globeEl = useRef<any>();
  const [boxRef, boxSize] = useElementSize();

  useEffect(() => {
    const handleVisibility = () => {
      globeEl.current.controls().autoRotate = globeEl.current && document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const globeReady = useCallback(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;

      globeEl.current.pointOfView({
        lat: 50,
        lng: 40,
        altitude: 1.4,
      });
    }
  }, []);

  const points = useMemo(
    () =>
      data.map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
        altitude: countToAltitude(point.count, data[0].count),
        radius: 0.3,
        color: palette.primary[400],
      })),
    [data, palette],
  );

  return (
    <Box ref={boxRef} sx={{ position: 'relative', height }}>
      <Suspense fallback={null}>
        <Globe
          customThreeObjectUpdate={(obj, d: any) => Object.assign(obj.position, globeEl.current?.getCoords(d.lat, d.lng, d.alt))}
          height={boxSize.height}
          onGlobeReady={globeReady}
          pointColor={(d: any) => weightColor(d.altitude)}
          pointsData={points}
          ref={globeEl}
          ringColor={() => ringsColorInterpolator}
          ringMaxRadius={5}
          ringPropagationSpeed={5}
          ringRepeatPeriod={400 / 3}
          ringsData={ringsData}
          width={boxSize.width}
        />
      </Suspense>
    </Box>
  );
});
