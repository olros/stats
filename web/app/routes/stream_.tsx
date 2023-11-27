import { Box, Container, Stack, Typography } from '@mui/joy';
import { useLoaderData } from '@remix-run/react';
import type { GlobeWithCitiesProps } from '~/components/next_statistics/GlobeWithCities';
import { GlobeWithCities } from '~/components/next_statistics/GlobeWithCities';
import { subHours } from 'date-fns';
import { useEffect, useState } from 'react';
import { jsonHash } from 'remix-utils/json-hash';
import { useEventSource } from 'remix-utils/sse/react';

import type { GeoLocationsEventData } from './stream.geolocations';
import { getTopGeoLocations, NEW_GEOLOCATION_EVENT } from './stream.geolocations';

export { ErrorBoundary } from '~/components/ErrorBoundary';

// Needs Prisma on Edge-functions as serverless functions times out after 10s
// Edge-functions have no timeout
export const loader = async () => jsonHash({ topGeoLocations: getTopGeoLocations(subHours(new Date(), 72)) });

export default function Stream() {
  const { topGeoLocations } = useLoaderData<typeof loader>();
  const [pointsData, setPointsData] = useState<GlobeWithCitiesProps['data']>(topGeoLocations);
  const [ringsData, setRingsData] = useState<Required<GlobeWithCitiesProps>['ringsData']>([]);

  const time = useEventSource('/stream/geolocations', { event: NEW_GEOLOCATION_EVENT });

  useEffect(() => {
    if (time) {
      const { geoLocations } = JSON.parse(time) as GeoLocationsEventData;
      setPointsData((prev) => {
        let newPointsData = [...prev];
        geoLocations.forEach((location) => {
          const existingPointIndex = newPointsData.findIndex((p) => p.name === location.name);
          if (existingPointIndex >= 0) {
            newPointsData[existingPointIndex] = { ...newPointsData[existingPointIndex], count: newPointsData[existingPointIndex].count + location.count };
          } else {
            newPointsData = [...newPointsData, location];
          }
        });
        return newPointsData;
      });
      setRingsData(geoLocations.map((p) => ({ lat: p.latitude, lng: p.longitude })));
      setTimeout(() => setRingsData([]), 1000);
    }
  }, [time]);

  return (
    <Container alignItems='center' component={Stack} sx={{ display: 'flex' }}>
      <Typography
        level='h1'
        sx={{
          fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
          fontWeight: '900',
          background: ({ palette }) => `linear-gradient(170deg, ${palette.danger[400]} 0%, ${palette.warning[400]} 100%)`,
          backgroundClip: 'text',
          textFillColor: 'transparent',
          pt: 4,
          pb: 2,
        }}
        textAlign='center'>
        GeoLocations stream
      </Typography>
      <Box sx={{ width: '100%', p: { xs: 0.5, sm: 1, md: 2 } }}>
        <GlobeWithCities data={pointsData} height={700} ringsData={ringsData} />
      </Box>
      <Typography component='a' href='https://github.com/olros/stats' sx={{ textAlign: 'center', my: 2 }} target='_blank'>
        @olros/stats
      </Typography>
    </Container>
  );
}
