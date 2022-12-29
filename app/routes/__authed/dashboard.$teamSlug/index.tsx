import { Box, Button, Card, Stack, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  const teamQuery = prismaClient.team.findFirst({
    where: {
      slug: params.teamSlug.toLowerCase(),
    },
  });
  const projectsQuery = prismaClient.project.findMany({
    where: {
      teamSlug: params.teamSlug.toLowerCase(),
    },
  });
  const [team, projects] = await Promise.all([teamQuery, projectsQuery]);

  if (!team) {
    throw redirect('/dashboard');
  }

  return json({ team, projects });
};

export default function TeamDashboard() {
  const { team, projects } = useLoaderData<typeof loader>();
  return (
    <>
      <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center' }}>
        <Typography level='h1'>{team.name}</Typography>
        <Stack direction='row' gap={1}>
          <Button component={Link} to='settings' variant='outlined'>
            Settings
          </Button>
          <Button component={Link} to='new-project'>
            New project
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
        {projects.map((project) => (
          <Card
            component={Link}
            key={project.slug}
            sx={{ textDecoration: 'none', '&:hover': { borderColor: 'neutral.outlinedHoverBorder' } }}
            to={project.slug}>
            <Typography fontSize='xl' level='h2'>
              {project.name}
            </Typography>
          </Card>
        ))}
      </Box>
    </>
  );
}
