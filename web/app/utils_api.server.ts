import type { Project, Team } from '@prisma/client';
import { utcToZonedTime } from 'date-fns-tz';

import { prismaClient } from './prismaClient';

/**
 * Get the date of the request, adjusted for the user's timezone
 * @param request Request
 * @returns Date
 */
export const getDate = (request: Request) => {
  // As long as the application is hosted on Vercel, x-vercel-ip-timezone
  // can be used to get the users timezone
  // https://vercel.com/docs/concepts/edge-network/headers#x-vercel-ip-timezone
  const timezone = request.headers.get('x-vercel-ip-timezone');
  const date = timezone ? utcToZonedTime(new Date(), timezone) : new Date();
  return date;
};

export const getProjectAndCheckPermissions = async (request: Request, teamSlug: Team['slug'], projectSlug: Project['slug']) => {
  const project = await prismaClient.project.findFirst({
    where: {
      slug: projectSlug,
      teamSlug,
    },
  });

  if (!project) {
    throw new Error(JSON.stringify({ errors: { name: `Can't find the given project` } }));
  }

  const origin = request.headers.get('origin');
  const originURL = origin ? new URL(origin) : null;
  const allowedOrigins = project.allowed_hosts.split(',').filter((_origin) => _origin.length > 0);

  if (allowedOrigins.length > 0 && (!originURL || !allowedOrigins.some((_origin) => originURL.host === _origin))) {
    throw new Error(JSON.stringify({ errors: { host: `The host is either not in headers or not declared as one of the allowed hosts` } }));
  }

  return { project };
};
