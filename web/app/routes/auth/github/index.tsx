import type { ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { authenticator } from '~/auth.server';

export const loader = async () => redirect('/');

export const action = async ({ request }: ActionArgs) => authenticator.authenticate('github', request);
