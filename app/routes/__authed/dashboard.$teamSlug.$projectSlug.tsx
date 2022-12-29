import { Container } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { ensureIsTeamMember, getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { parseJSON } from 'date-fns';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);

  const teamSlug = params.teamSlug.toLowerCase();
  const projectSlug = params.projectSlug.toLowerCase();
  const user = await getUserOrRedirect(request);

  const teamsQuery = prismaClient.team.findMany({
    where: {
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
  });
  const projectQuery = prismaClient.project.findFirst({ where: { slug: projectSlug, teamSlug } });

  const [teams, project] = await Promise.all([teamsQuery, projectQuery]);
  if (!teams.some((team) => team.slug === teamSlug)) {
    throw redirect('/dashboard');
  }
  if (!project) {
    throw redirect(`/dashboard/${teamSlug}`);
  }
  return json({ teams, project });
};

export default function ProjectDashboard() {
  const { teams, project } = useLoaderData<typeof loader>();
  return (
    <>
      <Navbar
        project={project ? { ...project, createdAt: parseJSON(project.createdAt) } : undefined}
        teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))}
      />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Outlet />
      </Container>
    </>
  );
}
