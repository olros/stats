import type { ActionFunctionArgs } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { authenticator } from '~/auth.server';

export const loader = async () => redirect('/');

export const action = async ({ request }: ActionFunctionArgs) => authenticator.authenticate('github', request);
