import type { RequestContext } from '@vercel/edge';
import type { ActionFunctionArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
import { forwardRequestToInternalApi } from '~/utils_edge.server';
import invariant from 'tiny-invariant';

export const config = { runtime: 'edge' };

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);
    const ctx = context as unknown as RequestContext;

    if ('waitUntil' in ctx) {
      ctx.waitUntil(forwardRequestToInternalApi(request, `${params.teamSlug}/${params.projectSlug}/pageview/`));
    } else {
      await forwardRequestToInternalApi(request, `${params.teamSlug}/${params.projectSlug}/pageview/`);
    }
    return json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[API] - Pageview', e);
    return json({ ok: false }, { status: 200 });
  }
};
