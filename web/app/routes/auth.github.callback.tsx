import type { LoaderFunctionArgs } from '@vercel/remix';
import { authenticator } from '~/auth.server';

export const loader = async ({ request, response }: LoaderFunctionArgs) => {
  console.log('GitHub callback loader', response);
  return authenticator.authenticate('github', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  });
};
