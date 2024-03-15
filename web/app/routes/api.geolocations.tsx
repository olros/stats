import { subHours } from 'date-fns';
import { json } from '@vercel/remix';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import { TopGeoLocationData } from '~/components/statistics/loader.server';

export const config = { runtime: 'edge' };

export async function loader() {
  const neon = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(neon);
  const prismaClient = new PrismaClient({ adapter });
  const geoLocations = prismaClient.$queryRaw<TopGeoLocationData[]>`
  SELECT CONCAT(l.flag, ' ', l.city) as "name", l.latitude, l.longitude, COUNT(*)::int as "count"
  FROM public."PageViewNext" p
  JOIN public."Location" l ON p."locationId" = l.id
  WHERE p.date >= ${subHours(new Date(), 24)}
  GROUP BY l.id
  ORDER BY "count" DESC
  LIMIT 250;
`;
  return json({ geoLocations });
}
