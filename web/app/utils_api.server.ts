import type { Project, Team } from '@prisma/client';

import { prismaClient } from './prismaClient';

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

  if (originURL && allowedOrigins.length > 0 && !allowedOrigins.some((_origin) => originURL.host === _origin)) {
    throw new Error(JSON.stringify({ errors: { host: `The host is either not in headers or not declared as one of the allowed hosts` } }));
  }

  return { project };
};
