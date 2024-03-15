import { type TopGeoLocationData } from '~/components/statistics/loader.server';
import { prismaClient } from '~/prismaClient';

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
