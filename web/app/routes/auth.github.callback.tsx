import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate('github', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  });
};
