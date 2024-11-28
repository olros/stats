import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/react';
import { authenticator } from '~/auth.server';

export const loader = async () => redirect('/');

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await authenticator.authenticate('github', request);
  if (user) {
    return redirect('/dashboard');
  }
  return redirect('/');
};
