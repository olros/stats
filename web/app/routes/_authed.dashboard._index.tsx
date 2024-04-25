import { Box, Button, Card, Stack, Typography } from '@mui/joy';
import { Link, NavLink, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { prismaClient } from '~/prismaClient';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
  return { teams };
};

export default function Dashboard() {
  const { teams } = useLoaderData<typeof loader>();
  return (
    <>
      <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center', viewTransitionName: 'header-old' }}>
        <Typography level='h1' sx={{ viewTransitionName: 'header-old-text' }}>
          Your teams
        </Typography>
        <Button component={Link} sx={{ viewTransitionName: 'create-team' }} to='new-team' unstable_viewTransition>
          New team
        </Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
        {teams.map((team) => (
          <Card
            component={NavLink}
            key={team.slug}
            sx={{
              '&.transitioning': { viewTransitionName: 'team-card', '& h2': { viewTransitionName: 'team-name' } },
              textDecoration: 'none',
              '&:hover': { borderColor: 'neutral.outlinedHoverBorder' },
            }}
            to={team.slug}
            unstable_viewTransition>
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
