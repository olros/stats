import { Outlet } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction = () => [{ title: 'Dashboard | Stats' }];

export default function Dashboard() {
  return <Outlet />;
}
