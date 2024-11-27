import { waitUntil } from '@vercel/functions';
import { data, type ActionFunctionArgs } from '@remix-run/node';
import { forwardRequestToInternalApi } from '~/utils_edge.server';
import invariant from 'tiny-invariant';

export const config = { runtime: 'edge' };

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    invariant(params.teamSlug, `Expected params.teamSlug`);
    invariant(params.projectSlug, `Expected params.projectSlug`);

    if (waitUntil) {
      waitUntil(forwardRequestToInternalApi(request, `${params.teamSlug}/${params.projectSlug}/event/`));
    } else {
      await forwardRequestToInternalApi(request, `${params.teamSlug}/${params.projectSlug}/event/`);
    }
    return data({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[API - Event]', e);
    return data({ ok: false }, { status: 400 });
  }
};
