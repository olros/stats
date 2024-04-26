import type { ActionFunctionArgs, LoaderFunctionArgs } from '@vercel/remix';
import { authenticator } from '~/auth.server';
import { redirect } from '~/utils.server';

export const loader = async ({ response }: LoaderFunctionArgs) => redirect(response, '/');

export const action = async ({ request }: ActionFunctionArgs) => authenticator.authenticate('github', request);
