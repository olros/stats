import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth.server';
import { redirect } from '~/utils.server';

export const loader = async ({ response }: LoaderFunctionArgs) => {
  console.log('GitHub index loader', response);
  return redirect(response, '/');
};

export const action = async ({ request, response }: ActionFunctionArgs) => {
  console.log('GitHub index action new Headers().getSetCookie', new Headers().getSetCookie);
  console.log('GitHub index action', response);
  try {
    const user = await authenticator.authenticate('github', request);
    console.log('GitHub index action - user', user);
    if (user) {
      return redirect(response, '/dashboard');
    }
    return redirect(response, '/');
  } catch (e) {
    console.error('GitHub index action - catch', e);
    if (e instanceof Response) {
      console.error('GitHub index action - getSetCookie', e.headers.getSetCookie());
      return new Response(undefined, { status: e.status, headers: e.headers });
    }
    throw e;
  }
};
