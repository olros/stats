import { Box, Card, Typography } from '@mui/joy';
import { NavLink, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  await ensureIsTeamMember(request, params.teamSlug);
  const projects = prismaClient.project.findMany({
    where: {
      teamSlug: params.teamSlug.toLowerCase(),
    },
  });

  return { projects: await projects };
};

export default function TeamDashboard() {
  const { projects } = useLoaderData<typeof loader>();
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
      {projects.length === 0 && <Typography>This team hasn't created any projects yet</Typography>}
      {projects.map((project) => (
        <Card
          component={NavLink}
          key={project.slug}
          sx={{
            overflowWrap: 'anywhere',
            textDecoration: 'none',
            '&:hover': { borderColor: 'neutral.outlinedHoverBorder' },
            '&.transitioning': {
              viewTransitionName: 'project-card',
              '& h3': { viewTransitionName: 'project-name' },
              '& p': { viewTransitionName: 'project-url' },
            },
          }}
          to={project.slug}
          unstable_viewTransition>
          <Typography fontSize='xl' level='h3'>
            {project.name}
          </Typography>
          <Typography fontSize='md'>{project.url}</Typography>
        </Card>
      ))}
    </Box>
  );
}
