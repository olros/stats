/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { RequestContext } from '@vercel/edge';
import type { ActionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import invariant from 'tiny-invariant';

export const config = { runtime: 'edge' };

export const action = async ({ request, params, context }: ActionArgs) => {
  invariant(params.teamSlug, `Expected params.teamSlug`);
  invariant(params.projectSlug, `Expected params.projectSlug`);
  const ctx = context as unknown as RequestContext;

  console.info('Edge-function pageview waitUntil', 'waitUntil' in ctx);
  if ('waitUntil' in ctx) {
    ctx.waitUntil(
      (async () => {
        const body = await request.json();
        console.info('Edge-function pageview body', body);
        console.info('Edge-function pageview VERCEL_URL', process.env.VERCEL_URL);
        const response = await fetch(`https://stats.olafros.com/api/${params.teamSlug}/${params.projectSlug}/pageview/`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: request.headers,
          // headers: {
          //   origin: request.headers.get('origin')! ?? `http://localhost:3000`,
          //   'user-agent': request.headers.get('user-agent')!,
          //   'x-vercel-ip-timezone': request.headers.get('x-vercel-ip-timezone')!,
          // },
        });
        const returnData = await response.json();
        console.info('Edge-function pageview response', returnData);
      })(),
    );
    return json({ ok: true }, { status: 200 });
  }

  return json({ ok: false }, { status: 200 });
};
