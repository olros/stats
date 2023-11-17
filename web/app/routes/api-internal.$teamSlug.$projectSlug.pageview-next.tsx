import type { Location, Prisma, Project } from '@prisma/client';
import type { Geo } from '@vercel/edge';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prismaClient } from '~/prismaClient';
import type { UserAgentData } from '~/user-agent';
import { getProjectAndCheckPermissions } from '~/utils_api.server';
import crypto from 'crypto';
import { format } from 'date-fns';
import invariant from 'tiny-invariant';

import type { PageviewInput } from '~/types';

export type PageviewRequestData = {
  data: PageviewInput;
  userAgentData: ReturnType<typeof getPageViewUserAgentData>;
  user_hash: Awaited<ReturnType<typeof getPageViewUserIdHash>>;
  date: string;
  geo: Required<Pick<Geo, 'city' | 'country' | 'flag' | 'latitude' | 'longitude'>>;
};

const parsePageviewRequestData = async (request: Request): Promise<PageviewRequestData> => {
  const data = (await request.json()) as PageviewRequestData;
  if (!data.data?.pathname) {
    throw JSON.stringify({ pathname: `Pathname isn't defined` });
  }
  if (!data.date) {
    throw JSON.stringify({ pathname: `Date isn't defined` });
  }
  if (!data.geo) {
    throw JSON.stringify({ pathname: `geo isn't defined` });
  }
  if (!data.userAgentData) {
    throw JSON.stringify({ pathname: `userAgentData isn't defined` });
  }
  if (!data.user_hash) {
    throw JSON.stringify({ pathname: `user_hash isn't defined` });
  }

  return data;
};

export const getPageViewUserIdHash = async (ip: string, userAgent: string, date: Date) => {
  invariant(process.env.SECRET_KEY, 'Expected environment variable "SECRET_KEY" to be set when tracking page visitors');
  const day = format(date, 'yyyy-MM-dd');
  const msgUint8 = new TextEncoder().encode(`${ip}_${userAgent}_${day}_${process.env.SECRET_KEY}`); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
};

export const getPageViewUserAgentData = (ua: UserAgentData): Pick<Prisma.PageViewNextCreateInput, 'browser' | 'device' | 'os'> => {
  const browser = ua.browser.name || null;
  const device = [ua.device.vendor, ua.device.model].filter(Boolean).join(' ') || null;
  const os = ua.os.name || null;
  return { browser, device, os };
};

const getLocation = async (geo: PageviewRequestData['geo']): Promise<Location> => {
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
  const { data, date, geo, userAgentData, user_hash } = await parsePageviewRequestData(request);

  const location = await getLocation(geo);

  await prismaClient.pageViewNext.create({
    data: {
      date: date,
      pathname: data.pathname,
      referrer: data.referrer,
      user_hash,
      browser: userAgentData.browser,
      device: userAgentData.device,
      os: userAgentData.os,
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

    await trackPageviewNext(request, project);

    return json({ ok: true }, { status: 202 });
  } catch (e) {
    console.error('[API-Internal - Pageview]', e);
    return json({ ok: false }, { status: 400 });
  }
};
