import { Link, Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { ensureIsTeamMember } from '~/auth.server';
import { LinkTabs } from '~/components/LinkTabs';
import { jsonHash } from 'remix-utils/json-hash';
import invariant from 'tiny-invariant';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.team.name} | Stats` }];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  return jsonHash({ team: ensureIsTeamMember(request, params.teamSlug) });
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
      <Card className='flex-column flex items-center justify-between gap-2 [view-transition-name:team-card] sm:flex-row'>
        <Typography variant='h1' className='py-1 [view-transition-name:team-name]'>
          {team.name}
        </Typography>
        <Button asChild>
          <Link unstable_viewTransition to='new-project'>
            New project
          </Link>
        </Button>
      </Card>
      <LinkTabs aria-label='Select team page' baseLocation={`/dashboard/${team.slug}`} key={team.slug} tabs={TABS} />
      <Outlet />
    </>
  );
}
