import { Card, Container, Stack, Tab, TabList, Tabs, Typography } from '@mui/joy';
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import type { LoaderArgs, V2_MetaFunction } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { json } from '@vercel/remix';
import { ensureIsTeamMember, getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { parseJSON } from 'date-fns';
import { useState } from 'react';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.project.name} | Stats` }];

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');
  const [team, user] = await Promise.all([ensureIsTeamMember(request, params.teamSlug), getUserOrRedirect(request)]);

  const projectSlug = params.projectSlug.toLowerCase();

  const teamsQuery = prismaClient.team.findMany({
    where: {
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
  });
  const projectQuery = prismaClient.project.findFirst({ where: { slug: projectSlug, teamSlug: team.slug } });

  const [teams, project] = await Promise.all([teamsQuery, projectQuery]);

  if (!project) {
    throw redirect(`/dashboard/${team.slug}`);
  }
  return json({ teams, team, project, user });
};

const TABS = [
  { label: 'Stats', url: '' },
  { label: 'Setup', url: 'setup' },
  { label: 'Settings', url: 'settings' },
];

export default function ProjectDashboard() {
  const { teams, team, project, user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [defaultLocation] = useState(location.pathname);
  const baseLocation = `/dashboard/${team.slug}/${project.slug}`;

  return (
    <>
      <Navbar
        project={project ? { ...project, createdAt: parseJSON(project.createdAt) } : undefined}
        teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))}
        user={user}
      />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center' }}>
          <Typography level='h1' sx={{ overflowWrap: 'anywhere' }}>
            {project.name}
          </Typography>
          <Typography component='a' fontSize='md' href={project.url} sx={{ overflowWrap: 'anywhere' }} target='_blank'>
            {project.url}
          </Typography>
        </Stack>
        <Tabs aria-label='Select team page' defaultValue={defaultLocation}>
          <TabList>
            {TABS.map((tab) => (
              <Tab component={Link} key={tab.url} to={tab.url} value={`${baseLocation}${tab.url.length ? `/${tab.url}` : ''}`}>
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
