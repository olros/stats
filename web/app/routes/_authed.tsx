import { Outlet } from '@remix-run/react';
import type { LoaderArgs } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderArgs) => {
  await getUserOrRedirect(request);
  return null;
};

export default function Index() {
  return <Outlet />;
}
