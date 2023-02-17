import { Card, Container, Stack, Tab, TabList, Tabs, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useLocation, useParams } from '@remix-run/react';
import { ensureIsTeamMember, getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { parseJSON } from 'date-fns';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  await ensureIsTeamMember(request, params.teamSlug);

  const teamSlug = params.teamSlug.toLowerCase();
  const projectSlug = params.projectSlug.toLowerCase();
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
  const projectQuery = prismaClient.project.findFirst({ where: { slug: projectSlug, teamSlug } });

  const [teams, project] = await Promise.all([teamsQuery, projectQuery]);
  if (!teams.some((team) => team.slug === teamSlug)) {
    throw redirect('/dashboard');
  }
  if (!project) {
    throw redirect(`/dashboard/${teamSlug}`);
  }
  return json({ teams, project, user });
};

const TABS = [
  { label: 'Pageviews', url: '' },
  { label: 'Setup', url: 'setup' },
  { label: 'Settings', url: 'settings' },
];

export default function ProjectDashboard() {
  const { teams, project, user } = useLoaderData<typeof loader>();
  const { teamSlug, projectSlug } = useParams() as { teamSlug: string; projectSlug: string };
  const location = useLocation();
  console.log(location);
  const baseLocation = `/dashboard/${teamSlug}/${projectSlug}`;

  return (
    <>
      <Navbar
        project={project ? { ...project, createdAt: parseJSON(project.createdAt) } : undefined}
        teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))}
        user={user}
      />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center' }}>
          <Typography level='h1'>{project.name}</Typography>
          <Typography fontSize='md'>{project.url}</Typography>
        </Stack>
        <Tabs aria-label='Plain tabs' sx={{ borderRadius: 'lg' }}>
          <TabList variant='outlined'>
            {TABS.map((tab) => (
              <Tab
                component={Link}
                key={tab.url}
                to={tab.url}
                variant={location.pathname === `${baseLocation}${tab.url.length ? `/${tab.url}` : ''}` ? 'soft' : 'plain'}>
                {tab.label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
        <Outlet />
      </Container>
    </>
  );
}
