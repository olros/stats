import { geolocation, ipAddress } from '@vercel/edge';
import type { RequestContext } from '@vercel/edge';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { userAgent } from '~/user-agent';
import { getDate } from '~/utils_api.server';
import { forwardRequestToInternalApi } from '~/utils_edge.server';
import invariant from 'tiny-invariant';

import type { PageviewInput } from '~/types';

import { getPageViewUserAgentData, getPageViewUserIdHash, type PageviewRequestData } from './api-internal.$teamSlug.$projectSlug.pageview-next';

export const config = { runtime: 'edge' };

const getPageViewNextRequest = async (request: Request): Promise<Request | undefined> => {
  const geo = geolocation(request);
  const ip = ipAddress(request);
  const ua = userAgent(request);
  const date = getDate(request);

  console.info('[API - PageViewNext]', { geo, ua, ip });

  const geoData = geo.city && geo.country && geo.flag && geo.latitude && geo.longitude ? (geo as PageviewRequestData['geo']) : undefined;
  if (!geoData || !ip || ua.isBot) {
    throw new Error(
      JSON.stringify({
        location: geoData ? undefined : `Location could not be found`,
        ip: ip ? undefined : `IP-address could not be found`,
        isBot: ua.isBot ? `Bot detected` : undefined,
      }),
    );
  }

  const userAgentData = getPageViewUserAgentData(ua);
  const user_hash = await getPageViewUserIdHash(ip, ua.ua, date);

  return new Request('', {
    body: JSON.stringify({
      data: (await request.json()) as PageviewInput,
      date: date.toJSON(),
      geo: geoData,
      user_hash,
      userAgentData,
    } satisfies PageviewRequestData),
  });
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);
    const ctx = context as unknown as RequestContext;

    const pageViewRequest = request.clone();
    const pageViewNextRequest = await getPageViewNextRequest(request.clone());

    const promise = Promise.all([
      forwardRequestToInternalApi(pageViewRequest, `${params.teamSlug}/${params.projectSlug}/pageview/`),
      ...(pageViewNextRequest ? [forwardRequestToInternalApi(pageViewNextRequest, `${params.teamSlug}/${params.projectSlug}/pageview-next/`)] : []),
    ]);

    if ('waitUntil' in ctx) {
      ctx.waitUntil(promise);
    } else {
      await promise;
    }
    return json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[API] - Pageview', e);
    return json({ ok: false }, { status: 200 });
  }
};
