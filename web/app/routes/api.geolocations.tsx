import { subHours } from 'date-fns';
import { getTopGeoLocations } from '~/functions.server/getTopGeoLocations';
import { json } from '@vercel/remix';

export const config = { runtime: 'edge' };

export async function loader() {
  const geoLocations = await getTopGeoLocations(subHours(new Date(), 24));
  return json({ geoLocations });
}
