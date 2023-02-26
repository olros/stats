import { Avatar, Button, Card, Container, Stack, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { parseJSON } from 'date-fns';
import { jsonHash } from 'remix-utils';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserOrRedirect(request);
  const teams = prismaClient.team.findMany({
    where: {
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
  });
  return jsonHash({ user, teams: await teams });
};

export default function Profile() {
  const { teams, user } = useLoaderData<typeof loader>();
  return (
    <>
      <Navbar teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))} user={user} />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Card>
          <Stack alignItems='center' direction='row' gap={1}>
            <Avatar alt={`Profile image of ${user.name}`} size='lg' src={user.avatar_url || undefined}>
              {user.name[0]}
            </Avatar>
            <Typography level='h1'>{user.name}</Typography>
          </Stack>
          <Typography level='body1'>Email: {user.email}</Typography>
          <Typography level='body1'>GitHub: {user.github_username}</Typography>
          <Button color='danger' component={Link} sx={{ mt: 2 }} to='/auth/logout' variant='outlined'>
            Log out
          </Button>
        </Card>
      </Container>
    </>
  );
}
