import type { LoaderArgs } from '@remix-run/node';
import { authenticator } from '~/auth.server';

export const loader = async ({ request }: LoaderArgs) => authenticator.logout(request, { redirectTo: '/' });
