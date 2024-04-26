import { useLoaderData } from '@remix-run/react';
import type { GlobeWithCitiesProps } from '~/components/statistics/GlobeWithCities';
import { GlobeWithCities } from '~/components/statistics/GlobeWithCities';
import { subHours } from 'date-fns';
import { useEffect, useState } from 'react';
import { jsonHash } from 'remix-utils/json-hash';
import { useEventSource } from 'remix-utils/sse/react';

import type { GeoLocationsEventData } from './stream.geolocations';
import { getTopGeoLocations } from '~/functions.server/getTopGeoLocations';
import { RepositoryLink } from '~/components/repository-link';
import { Container } from '~/components/container';
import { Typography } from '~/components/typography';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async () => jsonHash({ topGeoLocations: getTopGeoLocations(subHours(new Date(), 72)) });

export default function Stream() {
  const { topGeoLocations } = useLoaderData<typeof loader>();
  const [pointsData, setPointsData] = useState<GlobeWithCitiesProps['data']>(topGeoLocations);
  const [ringsData, setRingsData] = useState<Required<GlobeWithCitiesProps>['ringsData']>([]);

  const time = useEventSource('/stream/geolocations', { event: 'new-geolocation' });

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
    <Container>
      <Typography
        variant='h1'
        className='bg-gradient-to-br from-purple-700 to-red-600 bg-clip-text pt-8 pb-4 text-center text-8xl font-black text-transparent md:text-[10rem] lg:text-[12rem]'>
        GeoLocations stream
      </Typography>
      <div className='w-full p-1 sm:p-2 md:p-4'>
        <GlobeWithCities data={pointsData} height={700} ringsData={ringsData} />
      </div>
      <RepositoryLink />
    </Container>
  );
}
