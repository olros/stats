import type { LoaderFunctionArgs } from '@vercel/remix';
import { authenticator } from '~/auth.server';

export const config = { runtime: 'edge' };

export const loader = async ({ request }: LoaderFunctionArgs) =>
  authenticator.authenticate('github', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  });
