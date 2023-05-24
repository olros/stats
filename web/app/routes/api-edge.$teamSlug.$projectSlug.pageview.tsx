/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { RequestContext } from '@vercel/edge';
import type { ActionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import invariant from 'tiny-invariant';

export const config = { runtime: 'edge' };

const forwardPageview = async (request: Request, teamSlug: string, projectSlug: string) => {
  const host = process.env.NODE_ENV === 'production' ? 'https://stats.olafros.com' : 'http://localhost:3000';
  const body = await request.json();
  return fetch(`${host}/api/${teamSlug}/${projectSlug}/pageview/`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: request.headers,
  });
};

export const action = async ({ request, params, context }: ActionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);
    const ctx = context as unknown as RequestContext;

    if ('waitUntil' in ctx) {
      // ctx.waitUntil(
      //   (async () => {
      //     const host = process.env.NODE_ENV === 'production' ? 'https://stats.olafros.com' : 'http://localhost:3000';
      //     const body = await request.json();
      //     const response = await fetch(`${host}/api/${params.teamSlug}/${params.projectSlug}/pageview/`, {
      //       method: 'POST',
      //       body: JSON.stringify(body),
      //       headers: request.headers,
      //     });
      //     const returnData = await response.json();
      //     console.info('Edge-function pageview response:', returnData);
      //   })(),
      // );
      ctx.waitUntil(forwardPageview(request, params.teamSlug, params.projectSlug));
    } else {
      await forwardPageview(request, params.teamSlug, params.projectSlug);
    }
    return json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return json({ ok: false }, { status: 200 });
  }
};
