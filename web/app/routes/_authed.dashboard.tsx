import { Outlet } from '@remix-run/react';
import type { MetaFunction } from '@vercel/remix';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction = () => [{ title: 'Dashboard | Stats' }];

export default function Dashboard() {
  return <Outlet />;
}
