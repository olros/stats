import { Box, Card, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getUserOrRedirect } from '~/auth.server';
import { prismaClient } from '~/prismaClient';

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
  return json({ teams });
};

export default function Dashboard() {
  const { teams } = useLoaderData<typeof loader>();
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
        {teams.map((team) => (
          <Card component={Link} key={team.slug} sx={{ textDecoration: 'none', '&:hover': { borderColor: 'neutral.outlinedHoverBorder' } }} to={team.slug}>
            <Typography fontSize='xl' level='h2'>
              {team.name}
            </Typography>
          </Card>
        ))}
      </Box>
      {!teams.length && (
        <Card component={Link} sx={{ textDecoration: 'none', '&:hover': { borderColor: 'neutral.outlinedHoverBorder' } }} to='new-team'>
          <Typography fontSize='xl' level='h2'>
            Create team
          </Typography>
          <Typography>You're not part of any teams, click here to create a team</Typography>
        </Card>
      )}
    </>
  );
}
