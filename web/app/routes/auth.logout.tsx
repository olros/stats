import type { LoaderFunctionArgs } from '@vercel/remix';
import { authenticator } from '~/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => authenticator.logout(request, { redirectTo: '/' });
