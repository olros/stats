import type { LoaderArgs } from '@vercel/remix';
import { authenticator } from '~/auth.server';

export const loader = async ({ request }: LoaderArgs) => authenticator.logout(request, { redirectTo: '/' });
