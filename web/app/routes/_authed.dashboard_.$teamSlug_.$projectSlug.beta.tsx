import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { Statistics } from '~/components/next_statistics';
import { loadStatistics } from '~/components/next_statistics/loader.server';
import { jsonHash } from 'remix-utils/json-hash';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  return jsonHash({ statistics: loadStatistics({ request, teamSlug: params.teamSlug, projectSlug: params.projectSlug }) });
};

export default function ProjectPageviewsStatistics() {
  const { statistics } = useLoaderData<typeof loader>();

  return <Statistics statistics={statistics} />;
}
