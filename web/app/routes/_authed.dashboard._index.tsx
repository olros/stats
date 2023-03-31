import { Box, Button, Card, Stack, Typography } from '@mui/joy';
import type { LoaderArgs } from '@vercel/remix';
import { json } from '@vercel/remix';
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
      <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center' }}>
        <Typography level='h1'>Your teams</Typography>
        <Button component={Link} to='new-team'>
          New team
        </Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
        {teams.map((team) => (
          <Card component={Link} key={team.slug} sx={{ textDecoration: 'none', '&:hover': { borderColor: 'neutral.outlinedHoverBorder' } }} to={team.slug}>
            <Typography fontSize='xl' level='h2'>
              {team.name}
            </Typography>
          </Card>
        ))}
      </Box>
      {!teams.length && <Typography>You're not a member of any teams</Typography>}
    </>
  );
}
