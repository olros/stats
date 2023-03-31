import { Container } from '@mui/joy';
import type { LoaderArgs } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { json } from '@vercel/remix';
import { Outlet, useLoaderData } from '@remix-run/react';
import { getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { parseJSON } from 'date-fns';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  const teamSlug = params.teamSlug?.toLowerCase();
  const projectSlug = params.projectSlug?.toLowerCase();
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
  const projectQuery = !projectSlug || !teamSlug ? null : prismaClient.project.findFirst({ where: { slug: projectSlug, teamSlug } });

  const [teams, project] = await Promise.all([teamsQuery, projectQuery]);
  if (teamSlug && !teams.some((team) => team.slug === teamSlug)) {
    throw redirect('/dashboard');
  }
  if (projectSlug && !project) {
    throw redirect(`/dashboard/${teamSlug}`);
  }
  return json({ teams, project, user });
};

export default function Dashboard() {
  const { teams, project, user } = useLoaderData<typeof loader>();
  return (
    <>
      <Navbar
        project={project ? { ...project, createdAt: parseJSON(project.createdAt) } : undefined}
        teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))}
        user={user}
      />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Outlet />
      </Container>
    </>
  );
}
