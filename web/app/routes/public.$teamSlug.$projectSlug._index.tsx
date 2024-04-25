import { useLoaderData, useRevalidator } from '@remix-run/react';
import { type LoaderFunctionArgs } from '@vercel/remix';
import { Statistics } from '~/components/statistics';
import { loadStatistics } from '~/components/statistics/loader.server';
import { useInterval } from '~/hooks/useInterval';
import { secondsToMilliseconds } from 'date-fns';
import { jsonHash } from 'remix-utils/json-hash';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  return { statistics: await loadStatistics({ request, teamSlug: params.teamSlug, projectSlug: params.projectSlug }) };
};

export default function PublicPageviewsStatistics() {
  const { statistics } = useLoaderData<typeof loader>();

  const { revalidate } = useRevalidator();

  useInterval(() => {
    revalidate();
  }, secondsToMilliseconds(20));

  return <Statistics statistics={statistics} />;
}
