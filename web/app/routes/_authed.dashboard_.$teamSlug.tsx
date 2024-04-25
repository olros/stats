import { Button, Card, Stack, Typography } from '@mui/joy';
import { Link, MetaArgs_SingleFetch, Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { LinkTabs } from '~/components/LinkTabs';
import invariant from 'tiny-invariant';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta = ({ data }: MetaArgs_SingleFetch<typeof loader>) => [{ title: `${data?.team.name} | Stats` }];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  return { team: await ensureIsTeamMember(request, params.teamSlug) };
};

const TABS = [
  { label: 'Projects', url: '' },
  { label: 'Members', url: 'members' },
  { label: 'Usage', url: 'usage' },
  { label: 'Settings', url: 'settings' },
];

export default function ProjectDashboard() {
  const { team } = useLoaderData<typeof loader>();
  return (
    <>
      <Stack component={Card} direction={{ sm: 'row' }} gap={1} justifyContent='space-between' sx={{ alignItems: 'center', viewTransitionName: 'team-card' }}>
        <Typography level='h1' sx={{ viewTransitionName: 'team-name' }}>
          {team.name}
        </Typography>
        <Button component={Link} to='new-project' unstable_viewTransition>
          New project
        </Button>
      </Stack>
      <LinkTabs aria-label='Select team page' baseLocation={`/dashboard/${team.slug}`} key={team.slug} tabs={TABS} />
      <Outlet />
    </>
  );
}
