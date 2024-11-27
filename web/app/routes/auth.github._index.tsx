import type { ActionFunctionArgs } from '@remix-run/node';
import { data, redirect } from '@remix-run/react';
import { authenticator } from '~/auth.server';

export const loader = async () => {
  return redirect('/');
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const user = await authenticator.authenticate('github', request);
    if (user) {
      return redirect('/dashboard');
    }
    return redirect('/');
  } catch (e) {
    if (e instanceof Response) {
      return data(undefined, { status: e.status, headers: e.headers });
    }
    throw e;
  }
};
