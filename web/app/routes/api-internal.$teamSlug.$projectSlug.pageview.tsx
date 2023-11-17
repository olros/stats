import type { Location, Prisma, Project } from '@prisma/client';
import type { Geo } from '@vercel/edge';
import { geolocation, ipAddress } from '@vercel/edge';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prismaClient } from '~/prismaClient';
import type { UserAgentData } from '~/user-agent';
import { userAgent } from '~/user-agent';
import { screenWidthToDeviceType } from '~/utils';
import { getDate, getProjectAndCheckPermissions } from '~/utils_api.server';
import { getPageViewsUsage, getPageVisitorsUsage } from '~/utils_usage.server';
import crypto from 'crypto';
import { format, getHours } from 'date-fns';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';
import invariant from 'tiny-invariant';

import { DeviceType } from '~/types';
import type { PageviewInput } from '~/types';

const parsePageviewInput = async (request: Request): Promise<PageviewInput> => {
  const data = (await request.json()) as PageviewInput;
  if (!data.pathname) {
    throw JSON.stringify({ pathname: `Pathname isn't defined` });
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

const hashPageVisitorIdentifier = async (clientIp: string, userAgent: string) => {
  invariant(process.env.SECRET_KEY, 'Expected environment variable "SECRET_KEY" to be set when tracking page visitors');
  const msgUint8 = new TextEncoder().encode(`${clientIp}_${userAgent}_${process.env.SECRET_KEY}`); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
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

  if (!clientIp || !userAgent) {
    return;
  }

  const hashed_user_id = await hashPageVisitorIdentifier(clientIp, userAgent);

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

const getPageViewUserIdHash = async (ip: string, userAgent: string, date: Date) => {
  invariant(process.env.SECRET_KEY, 'Expected environment variable "SECRET_KEY" to be set when tracking page visitors');
  const day = format(date, 'yyyy-MM-dd');
  const msgUint8 = new TextEncoder().encode(`${ip}_${userAgent}_${day}_${process.env.SECRET_KEY}`); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
};

const getPageViewUserAgentData = (ua: UserAgentData): Pick<Prisma.PageViewNextCreateInput, 'browser' | 'device' | 'os'> => {
  const browser = ua.browser.name || null;
  const device = [ua.device.vendor, ua.device.model].filter(Boolean).join(' ') || null;
  const os = ua.os.name || null;
  return { browser, device, os };
};

const getLocation = async (geo: Geo): Promise<Location | undefined> => {
  if (!geo.city || !geo.country || !geo.flag || !geo.latitude || !geo.longitude) {
    return undefined;
  }
  const flag_country_city: Prisma.LocationFlagCountryCityCompoundUniqueInput = { flag: geo.flag, country: geo.country, city: geo.city };
  const location: Prisma.LocationCreateWithoutPageViewsInput = {
    ...flag_country_city,
    latitude: Number(geo.latitude),
    longitude: Number(geo.longitude),
  };
  return await prismaClient.location.upsert({
    create: location,
    update: {},
    where: { flag_country_city },
  });
};

const trackPageviewNext = async (request: Request, project: Project) => {
  const geo = geolocation(request);
  const ip = ipAddress(request);
  const ua = userAgent(request);

  console.info('[API-Internal - PageViewNext]', { geo, ua, ip });

  const location = await getLocation(geo);

  if (!location || !ip || ua.isBot) {
    throw new Error(
      JSON.stringify({
        location: location ? undefined : `Location could not be found`,
        ip: ip ? undefined : `IP-address could not be found`,
        isBot: ua.isBot ? `Bot detected` : undefined,
      }),
    );
  }

  const date = getDate(request);
  const { browser, device, os } = getPageViewUserAgentData(ua);
  const [data, user_hash] = await Promise.all([parsePageviewInput(request), getPageViewUserIdHash(ip, ua.ua, date)]);

  await prismaClient.pageViewNext.create({
    data: {
      date,
      pathname: data.pathname,
      referrer: data.referrer,
      user_hash,
      browser,
      device,
      os,
      projectId: project.id,
      locationId: location.id,
    },
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);

    const { project } = await getProjectAndCheckPermissions(request, params.teamSlug, params.projectSlug);

    await Promise.all([trackPageview(request, project), trackPageVisitor(request, project), trackPageviewNext(request, project)]);

    return json({ ok: true }, { status: 202 });
  } catch (e) {
    console.error('[API-Internal - Pageview]', e);
    return json({ ok: false }, { status: 400 });
  }
};
