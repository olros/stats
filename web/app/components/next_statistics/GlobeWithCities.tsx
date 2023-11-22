/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, useTheme } from '@mui/joy';
import { useElementSize } from '~/hooks/useElementSize';
import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef } from 'react';

const Globe = lazy(() => import('~/components/lazy/Globe'));

type GlobeWithCitiesValues = {
  latitude: number;
  longitude: number;
  count: number;
};

export type GlobeWithCitiesProps = {
  data: GlobeWithCitiesValues[];
};

export const GlobeWithCities = memo(({ data }: GlobeWithCitiesProps) => {
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
        altitude: 1.2,
      });
    }
  }, []);

  const points = useMemo(
    () =>
      data.map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
        altitude: Math.min(0.8, Math.max(0.01, point.count / (data[0].count * 0.6))),
        radius: 0.3,
        color: palette.primary[400],
      })),
    [data, palette],
  );

  return (
    <Box ref={boxRef} sx={{ position: 'relative', height: 400 }}>
      <Suspense fallback={null}>
        <Globe
          customThreeObjectUpdate={(obj, d: any) => Object.assign(obj.position, globeEl.current?.getCoords(d.lat, d.lng, d.alt))}
          height={boxSize.height}
          onGlobeReady={globeReady}
          pointsData={points}
          ref={globeEl}
          width={boxSize.width}
        />
      </Suspense>
    </Box>
  );
});
