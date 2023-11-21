import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { loadStatistics } from '~/components/next_statistics/loader';
import { jsonHash } from 'remix-utils/json-hash';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  const statistics = await loadStatistics({ request, teamSlug: params.teamSlug, projectSlug: params.projectSlug });
  console.log(statistics);
  return jsonHash({
    statistics: loadStatistics({ request, teamSlug: params.teamSlug, projectSlug: params.projectSlug }),
  });
};

export default function ProjectPageviewsStatistics() {
  const { statistics } = useLoaderData<typeof loader>();

  console.log(statistics);

  return <p>Statistics</p>;
}
