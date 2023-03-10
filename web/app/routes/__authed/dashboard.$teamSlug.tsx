import { Button, Card, Container, Stack, Tab, TabList, Tabs, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { ensureIsTeamMember, getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { parseJSON } from 'date-fns';
import { jsonHash } from 'remix-utils';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  const [team, user] = await Promise.all([ensureIsTeamMember(request, params.teamSlug), getUserOrRedirect(request)]);

  const teams = prismaClient.team.findMany({
    where: {
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  return jsonHash({ teams: await teams, team, user });
};

const TABS = [
  { label: 'Projects', url: '' },
  { label: 'Members', url: 'members' },
  { label: 'Usage', url: 'usage' },
  { label: 'Settings', url: 'settings' },
];

export default function ProjectDashboard() {
  const { teams, team, user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const baseLocation = `/dashboard/${team.slug}`;

  return (
    <>
      <Navbar teams={teams.map((team) => ({ ...team, createdAt: parseJSON(team.createdAt) }))} user={user} />
      <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center' }}>
          <Typography level='h1'>{team.name}</Typography>
          <Button component={Link} to='new-project'>
            New project
          </Button>
        </Stack>
        <Tabs aria-label='Select project page' sx={{ borderRadius: 'lg' }}>
          <TabList>
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
