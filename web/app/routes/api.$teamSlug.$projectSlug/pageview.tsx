import type { Prisma, Project } from '@prisma/client';
import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prismaClient } from '~/prismaClient';
import { screenWidthToDeviceType } from '~/utils';
import { getDate, getProjectAndCheckPermissions } from '~/utils_api.server';
import { getPageViewsUsage, getPageVisitorsUsage } from '~/utils_usage.server';
import { getHours } from 'date-fns';
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

const trackPageview = async (request: Request, project: Project) => {
  const { pageViews } = await getPageViewsUsage(project.teamSlug);

  if (!pageViews.withinLimit) {
    return;
  }

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

  const { pageVisitors } = await getPageVisitorsUsage(project.teamSlug);

  if (!pageVisitors.withinLimit) {
    return;
  }

  const clientIp = getClientIPAddress(request.headers);
  const userAgent = request.headers.get('user-agent');

  if (!clientIp) {
    return;
  }

  invariant(process.env.SECRET_KEY, 'Expected environment variable "SECRET_KEY" to be set when tracking page visitors');
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

  const { project } = await getProjectAndCheckPermissions(request, params.teamSlug, params.projectSlug);

  await Promise.all([trackPageview(request, project), trackPageVisitor(request, project)]);

  return json({}, { status: 202 });
};
