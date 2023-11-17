import { geolocation, ipAddress } from '@vercel/edge';
import type { RequestContext } from '@vercel/edge';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import type { UserAgentData } from '~/user-agent';
import { userAgent } from '~/user-agent';
import { getDate } from '~/utils_api.server';
import { forwardRequestToInternalApi } from '~/utils_edge.server';
import { format } from 'date-fns';
import invariant from 'tiny-invariant';

import type { PageviewInput } from '~/types';

import type { PageviewRequestData } from './api-internal.$teamSlug.$projectSlug.pageview-next';

export const config = { runtime: 'edge' };

export const getPageViewUserIdHash = async (ip: string, userAgent: string, date: Date): Promise<PageviewRequestData['user_hash']> => {
  invariant(process.env.SECRET_KEY, 'Expected environment variable "SECRET_KEY" to be set when tracking page visitors');
  const day = format(date, 'yyyy-MM-dd');
  const userId = `${ip}_${userAgent}_${day}_${process.env.SECRET_KEY}`;
  try {
    const msgUint8 = new TextEncoder().encode(userId); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  } catch (e) {
    console.error('[API - UserIdHash]', e);
    return userId;
  }
};

export const getPageViewUserAgentData = (ua: UserAgentData): PageviewRequestData['userAgentData'] => {
  const browser = ua.browser.name || null;
  const device = [ua.device.vendor, ua.device.model].filter(Boolean).join(' ') || null;
  const os = ua.os.name || null;
  return { browser, device, os };
};

const getPageViewNextRequest = async (request: Request): Promise<Request | undefined> => {
  const geo = geolocation(request);
  const ip = ipAddress(request);
  const ua = userAgent(request);
  const date = getDate(request);
  console.error('[API - getPageViewNextRequest] 0', { geo, ip, ua, date });

  const geoData: PageviewRequestData['geo'] | undefined =
    geo.city && geo.country && geo.flag && geo.latitude && geo.longitude ? (geo as PageviewRequestData['geo']) : undefined;
  if (!geoData || !ip || ua.isBot) {
    console.error(
      '[API - getPageViewNextRequest] 1',
      new Error(
        JSON.stringify({
          location: geoData ? undefined : `Location could not be found`,
          ip: ip ? undefined : `IP-address could not be found`,
          isBot: ua.isBot ? `Bot detected` : undefined,
        }),
      ),
    );
    return undefined;
  }

  const userAgentData = getPageViewUserAgentData(ua);
  const user_hash = await getPageViewUserIdHash(ip, ua.ua, date);

  const body = {
    data: (await request.json()) as PageviewInput,
    date: date.toJSON(),
    geo: geoData,
    user_hash,
    userAgentData,
  } satisfies PageviewRequestData;

  console.error('[API - getPageViewNextRequest] 2', body);

  return new Request('https://stats.olafros.com/api/pageview-next', {
    method: 'POST',
    body: JSON.stringify(body),
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
  } catch (e) {
    console.error('[API - Pageview]', e);
    return json({ ok: false }, { status: 200 });
  }
  return json({ ok: true }, { status: 200 });
};
