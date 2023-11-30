import type { Location, Prisma, Project } from '@prisma/client';
import type { Geo } from '@vercel/edge';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { prismaClient } from '~/prismaClient';
import { getProjectAndCheckPermissions } from '~/utils_api.server';
import { getPageViewsNextUsage } from '~/utils_usage.server';
import invariant from 'tiny-invariant';

import type { PageviewInput } from '~/types';

export type PageviewRequestData = {
  data: PageviewInput;
  userAgentData: Pick<Prisma.PageViewNextCreateInput, 'browser' | 'device' | 'os'>;
  user_hash: string;
  date: string;
  geo: Required<Pick<Geo, 'city' | 'country' | 'flag' | 'latitude' | 'longitude'>>;
};

const parsePageviewRequestData = async (request: Request): Promise<PageviewRequestData> => {
  const data = (await request.json()) as PageviewRequestData;
  if (!data.data?.pathname) {
    throw new Error(JSON.stringify({ pathname: `Pathname isn't defined` }));
  }
  if (!data.date) {
    throw new Error(JSON.stringify({ pathname: `Date isn't defined` }));
  }
  if (!data.geo) {
    throw new Error(JSON.stringify({ pathname: `geo isn't defined` }));
  }
  if (!data.userAgentData) {
    throw new Error(JSON.stringify({ pathname: `userAgentData isn't defined` }));
  }
  if (!data.user_hash) {
    throw new Error(JSON.stringify({ pathname: `user_hash isn't defined` }));
  }

  return data;
};

const getLocation = async (geo: PageviewRequestData['geo']): Promise<Location> => {
  const country_city: Prisma.LocationCountryCityCompoundUniqueInput = { country: geo.country, city: decodeURIComponent(geo.city) };
  const location: Prisma.LocationCreateWithoutPageViewsInput = {
    ...country_city,
    flag: geo.flag,
    latitude: Number(geo.latitude),
    longitude: Number(geo.longitude),
  };
  return await prismaClient.location.upsert({
    create: location,
    update: {},
    where: { country_city },
  });
};

const trackPageviewNext = async (request: Request, project: Project) => {
  const { pageViewsNext } = await getPageViewsNextUsage(project.teamSlug);

  if (!pageViewsNext.withinLimit) {
    return;
  }

  const { data, date, geo, userAgentData, user_hash } = await parsePageviewRequestData(request);

  const location = await getLocation(geo);

  await prismaClient.pageViewNext.create({
    data: {
      date,
      pathname: data.pathname,
      referrer: data.referrer ? new URL(data.referrer).host : null,
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
  } catch (e) {
    console.error('[API-Internal - PageviewNext]', e);
    return json({ ok: false }, { status: 400 });
  }
  return json({ ok: true }, { status: 202 });
};
