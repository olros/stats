import type { ActionArgs } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { authenticator } from '~/auth.server';

export const loader = async () => redirect('/');

export const action = async ({ request }: ActionArgs) => authenticator.authenticate('github', request);
