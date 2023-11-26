import type { LoaderFunctionArgs } from '@remix-run/node';
import type { TopGeoLocationData } from '~/components/next_statistics/loader.server';
import { prismaClient } from '~/prismaClient';
import { secondsToMilliseconds, subMilliseconds } from 'date-fns';
import { eventStream } from 'remix-utils/sse/server';
import { interval } from 'remix-utils/timers';

export const getTopGeoLocations = async (dateGte: Date): Promise<TopGeoLocationData[]> => {
  return prismaClient.$queryRaw<TopGeoLocationData[]>`
    SELECT CONCAT(l.flag, ' ', l.city) as "name", l.latitude, l.longitude, COUNT(*)::int as "count"
    FROM public."PageViewNext" p
    JOIN public."Location" l ON p."locationId" = l.id
    WHERE p.date >= ${dateGte}
    GROUP BY l.id
    ORDER BY "count" DESC
    LIMIT 250;
  `;
};

export const NEW_GEOLOCATION_EVENT = 'new-geolocation';
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
            event: NEW_GEOLOCATION_EVENT,
            data: JSON.stringify({ time: new Date().getTime(), geoLocations: newGeoLocations } satisfies GeoLocationsEventData),
          });
        }
      }
    };

    run();
    return () => null;
  });
}
