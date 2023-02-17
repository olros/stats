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
  await ensureIsTeamMember(request, params.teamSlug);

  const teamSlug = params.teamSlug.toLowerCase();
  const user = await getUserOrRedirect(request);

  const teams = await prismaClient.team.findMany({
    where: {
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  if (!teams.some((team) => team.slug === teamSlug)) {
    throw redirect('/dashboard');
  }
  return json({ teams, user });
};

export default function TeamDashboard() {
  const { teams, user } = useLoaderData<typeof loader>();
  return (
    <>
      <Navbar teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))} user={user} />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Outlet />
      </Container>
    </>
  );
}
