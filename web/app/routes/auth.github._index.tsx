import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { authenticator } from '~/auth.server';
import { redirect } from '~/utils.server';

export const loader = async ({ response }: LoaderFunctionArgs) => {
  console.log('GitHub index loader', response);
  return redirect(response, '/');
};

export const action = async ({ request, response }: ActionFunctionArgs) => {
  console.log('GitHub index action', response);
  return authenticator.authenticate('github', request, {
    failureRedirect: '/',
    successRedirect: '/dashboard',
  });
};
