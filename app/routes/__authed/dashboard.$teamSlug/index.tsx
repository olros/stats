import { Box, Card, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  const projects = await prismaClient.project.findMany({
    where: {
      teamSlug: params.teamSlug.toLowerCase(),
    },
  });

  return json({ projects });
};

export default function TeamDashboard() {
  const { projects } = useLoaderData<typeof loader>();
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
        {projects.map((project) => (
          <Card
            component={Link}
            key={project.slug}
            sx={{ textDecoration: 'none', '&:hover': { borderColor: 'neutral.outlinedHoverBorder' } }}
            to={project.slug}>
            <Typography fontSize='xl' level='h3'>
              {project.name}
            </Typography>
            <Typography fontSize='md'>{project.url}</Typography>
          </Card>
        ))}
      </Box>
    </>
  );
}
