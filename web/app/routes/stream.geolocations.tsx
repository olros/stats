import type { LoaderFunctionArgs } from '@remix-run/node';
import type { TopGeoLocationData } from '~/components/statistics/loader.server';
import { secondsToMilliseconds, subMilliseconds } from 'date-fns';
import { eventStream } from 'remix-utils/sse/server';
import { interval } from 'remix-utils/timers';
import { getTopGeoLocations } from '~/functions.server/getTopGeoLocations';

export const config = { runtime: 'edge' };

export type GeoLocationsEventData = { time: number; geoLocations: TopGeoLocationData[] };

const POLL_INTERVAL = secondsToMilliseconds(2);

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, (send) => {
    const run = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of interval(POLL_INTERVAL, { signal: request.signal })) {
        const newGeoLocations = await getTopGeoLocations(subMilliseconds(new Date(), POLL_INTERVAL));
        if (newGeoLocations.length > 0) {
          send({
            event: 'new-geolocation',
            data: JSON.stringify({ time: new Date().getTime(), geoLocations: newGeoLocations } satisfies GeoLocationsEventData),
          });
        }
      }
    };

    run();
    return () => null;
  });
}
