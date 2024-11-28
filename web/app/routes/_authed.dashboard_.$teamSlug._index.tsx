import { NavLink, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';
import { Typography } from '~/components/typography';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  const projects = prismaClient.project.findMany({
    where: {
      teamSlug: params.teamSlug.toLowerCase(),
    },
  });

  return { projects: await projects };
};

export default function TeamDashboard() {
  const { projects } = useLoaderData<typeof loader>();
  return (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
      {projects.length === 0 && <Typography>This team hasn't created any projects yet</Typography>}
      {projects.map((project) => (
        <NavLink
          className='bg-card text-card-foreground break-a overflow-hidden rounded-xl border p-4 overflow-ellipsis shadow hover:border-slate-600'
          key={project.slug}
          to={project.slug}>
          <Typography variant='h3'>{project.name}</Typography>
          <Typography variant='muted'>{project.url}</Typography>
        </NavLink>
      ))}
    </div>
  );
}
