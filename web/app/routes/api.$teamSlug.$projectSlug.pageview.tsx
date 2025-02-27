import { geolocation, ipAddress, waitUntil } from '@vercel/functions';
import type { ActionFunctionArgs } from '@remix-run/node';
import type { UserAgentData } from '~/user-agent';
import { userAgent } from '~/user-agent';
import { forwardRequestToInternalApi } from '~/utils_edge.server';
import { format } from 'date-fns';
import invariant from 'tiny-invariant';

import type { PageviewInput } from '~/types';

import type { PageviewRequestData } from './api-internal.$teamSlug.$projectSlug.pageview';

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
  const date = new Date();

  const geoData: PageviewRequestData['geo'] | undefined =
    geo.city && geo.country && geo.flag && geo.latitude && geo.longitude ? (geo as PageviewRequestData['geo']) : undefined;
  if (!geoData || !ip || ua.isBot) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[API - getPageViewNextRequest]',
        new Error(
          JSON.stringify({
            location: geoData ? undefined : `Location could not be found: ${JSON.stringify(geo)}`,
            ip: ip ? undefined : `IP-address could not be found`,
            isBot: ua.isBot ? `Bot detected: ${ua.ua}` : undefined,
          }),
        ),
      );
    }
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

  return new Request(request.url, {
    headers: new Headers(request.headers),
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);

    const pageViewNextRequest = await getPageViewNextRequest(request);

    const promises = Promise.all([
      ...(pageViewNextRequest ? [forwardRequestToInternalApi(pageViewNextRequest, `${params.teamSlug}/${params.projectSlug}/pageview/`)] : []),
    ]);

    if (waitUntil) {
      waitUntil(promises);
    } else {
      await promises;
    }
  } catch (e) {
    console.error('[API - Pageview]', e);
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
