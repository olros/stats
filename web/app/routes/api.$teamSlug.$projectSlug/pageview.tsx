import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prismaClient } from '~/prismaClient';
import { screenWidthToDeviceType } from '~/utils';
import { getHours } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
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

export const action = async ({ request, params }: ActionArgs) => {
  invariant(params.teamSlug, `Expected params.teamSlug`);
  invariant(params.projectSlug, `Expected params.projectSlug`);
  const data = await parsePageviewInput(request);
  const deviceType = typeof data.screen_width === 'number' ? screenWidthToDeviceType(data.screen_width) : null;
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

  // As long as the application is hosted on Vercel, x-vercel-ip-timezone
  // can be used to get the users timezone
  // https://vercel.com/docs/concepts/edge-network/headers#x-vercel-ip-timezone
  const timezone = request.headers.get('x-vercel-ip-timezone');
  const date = timezone ? utcToZonedTime(new Date(), timezone) : new Date();
  const hour = getHours(date);

  await prismaClient.pageView.upsert({
    create: {
      projectId: project.id,
      date,
      hour,
      pathname: data.pathname,
      count: 1,
      dekstop_count: deviceType === DeviceType.DESKTOP ? 1 : 0,
      tablet_count: deviceType === DeviceType.TABLET ? 1 : 0,
      mobile_count: deviceType === DeviceType.MOBILE ? 1 : 0,
    },
    where: {
      projectId_date_hour_pathname: {
        date,
        hour,
        projectId: project.id,
        pathname: data.pathname,
      },
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
  return json({}, { status: 202 });
};
