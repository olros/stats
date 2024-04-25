import { Card, Stack, Typography } from '@mui/joy';
import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { LinkTabs } from '~/components/LinkTabs';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';
import { redirect } from '~/utils.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.project.name} | Stats` }];

export const loader = async ({ response, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');

  const teamSlug = params.teamSlug.toLowerCase();
  const projectSlug = params.projectSlug.toLowerCase();

  const project = await prismaClient.project.findFirst({ where: { slug: projectSlug, teamSlug: teamSlug } });

  if (!project) {
    throw redirect(response, `/dashboard/${teamSlug}`);
  }
  return { teamSlug, project };
};

const TABS = [
  { label: 'Stats', url: '' },
  { label: 'Setup', url: 'setup' },
  { label: 'Settings', url: 'settings' },
];

export default function ProjectDashboard() {
  const { teamSlug, project } = useLoaderData<typeof loader>();
  return (
    <>
      <Stack
        component={Card}
        direction={{ sm: 'row' }}
        gap={1}
        justifyContent='space-between'
        sx={{ alignItems: 'center', viewTransitionName: 'project-card' }}>
        <Typography level='h1' sx={{ overflowWrap: 'anywhere', viewTransitionName: 'project-name' }}>
          {project.name}
        </Typography>
        <Typography component='a' fontSize='md' href={project.url} sx={{ overflowWrap: 'anywhere', viewTransitionName: 'project-url' }} target='_blank'>
          {project.url}
        </Typography>
      </Stack>
      <LinkTabs aria-label='Select project page' baseLocation={`/dashboard/${teamSlug}/${project.slug}`} key={`${teamSlug}/${project.slug}`} tabs={TABS} />
      <Outlet />
    </>
  );
}
