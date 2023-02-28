import type { Prisma, Project } from '@prisma/client';
import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prismaClient } from '~/prismaClient';
import { screenWidthToDeviceType } from '~/utils';
import { getHours } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { getClientIPAddress } from 'remix-utils';
import invariant from 'tiny-invariant';

import { DeviceType } from '~/types';
import type { PageviewInput } from '~/types';

const parsePageviewInput = async (request: Request): Promise<PageviewInput> => {
  const data = (await request.json()) as PageviewInput;
  if (!data.pathname) {
    throw json({ errors: { pathname: `Pathname isn't defined` } }, { status: 400 });
  }

  return data;
};

const getDate = (request: Request) => {
  // As long as the application is hosted on Vercel, x-vercel-ip-timezone
  // can be used to get the users timezone
  // https://vercel.com/docs/concepts/edge-network/headers#x-vercel-ip-timezone
  const timezone = request.headers.get('x-vercel-ip-timezone');
  const date = timezone ? utcToZonedTime(new Date(), timezone) : new Date();
  return date;
};

const trackPageview = async (request: Request, project: Project) => {
  const data = await parsePageviewInput(request);

  const date = getDate(request);
  const hour = getHours(date);

  const deviceType = typeof data.screen_width === 'number' ? screenWidthToDeviceType(data.screen_width) : null;

  const pageViewCompoundUnique: Prisma.PageViewProjectIdDateHourPathnameCompoundUniqueInput = {
    date,
    hour,
    projectId: project.id,
    pathname: data.pathname,
  };

  await prismaClient.pageView.upsert({
    create: {
      ...pageViewCompoundUnique,
      count: 1,
      dekstop_count: deviceType === DeviceType.DESKTOP ? 1 : 0,
      tablet_count: deviceType === DeviceType.TABLET ? 1 : 0,
      mobile_count: deviceType === DeviceType.MOBILE ? 1 : 0,
    },
    where: {
      projectId_date_hour_pathname: pageViewCompoundUnique,
    },
    update: {
      count: { increment: 1 },
      ...(deviceType === DeviceType.DESKTOP
        ? {
            dekstop_count: { increment: 1 },
          }
        : {}),
      ...(deviceType === DeviceType.TABLET
        ? {
            tablet_count: { increment: 1 },
          }
        : {}),
      ...(deviceType === DeviceType.MOBILE
        ? {
            mobile_count: { increment: 1 },
          }
        : {}),
    },
  });
};

const trackPageVisitor = async (request: Request, project: Project) => {
  if (!project.track_page_visitors) {
    return;
  }

  const clientIp = getClientIPAddress(request.headers);
  const userAgent = request.headers.get('user-agent');

  if (!clientIp) {
    return;
  }

  invariant(process.env.SECRET_KEY, 'Missin environment variable "SECRET_KEY"');
  const { createHmac } = await import('crypto');
  const hashed_user_id = createHmac('sha512', process.env.SECRET_KEY).update(`${clientIp}_${userAgent}`).digest('hex');

  const pageVisitorCompoundUnique: Prisma.PageVisitorProjectIdDateHashed_user_idCompoundUniqueInput = {
    projectId: project.id,
    hashed_user_id,
    date: getDate(request),
  };

  await prismaClient.pageVisitor.upsert({
    create: pageVisitorCompoundUnique,
    where: {
      projectId_date_hashed_user_id: pageVisitorCompoundUnique,
    },
    update: {},
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  invariant(params.teamSlug, `Expected params.teamSlug`);
  invariant(params.projectSlug, `Expected params.projectSlug`);

  const project = await prismaClient.project.findFirst({
    where: {
      slug: params.projectSlug,
      teamSlug: params.teamSlug,
    },
  });

  if (!project) {
    return json({ errors: { name: `Can't find the given project` } }, { status: 404 });
  }

  const host = request.headers.get('host');
  const allowedHosts = project.allowed_hosts.split(',').filter((i) => i.length);

  if (allowedHosts.length > 0 && (!host || !allowedHosts.includes(host))) {
    return json({ errors: { host: `The host is either not in headers or not declared as one of the allowed hosts` } }, { status: 404 });
  }

  await Promise.all([trackPageview(request, project), trackPageVisitor(request, project)]);

  return json({}, { status: 202 });
};
