import { Card, Container, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { parseJSON } from 'date-fns';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderArgs) => {
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
  return json({ user, teams });
};

export default function Dashboard() {
  const { teams, user } = useLoaderData<typeof loader>();
  return (
    <>
      <Navbar teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))} user={user} />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Card>
          <Typography level='h1'>{user.name}</Typography>
          <Typography level='body1'>Email: {user.email}</Typography>
          <Typography level='body1'>GitHub: {user.github_username}</Typography>
        </Card>
      </Container>
    </>
  );
}
