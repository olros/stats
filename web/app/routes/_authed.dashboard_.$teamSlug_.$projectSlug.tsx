import { Outlet, useLoaderData, redirect } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { LinkTabs } from '~/components/LinkTabs';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.project.name} | Stats` }];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');

  const teamSlug = params.teamSlug.toLowerCase();
  const projectSlug = params.projectSlug.toLowerCase();

  const project = await prismaClient.project.findFirst({ where: { slug: projectSlug, teamSlug: teamSlug } });

  if (!project) {
    return redirect(`/dashboard/${teamSlug}`);
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
      <Card className='flex items-center justify-between gap-2'>
        <Typography variant='h1' className='overflow-hidden text-ellipsis py-1'>
          {project.name}
        </Typography>
        <Typography asChild variant='small'>
          <a href={project.url} className=' overflow-hidden text-ellipsis underline' target='_blank'>
            {project.url}
          </a>
        </Typography>
      </Card>
      <LinkTabs aria-label='Select project page' baseLocation={`/dashboard/${teamSlug}/${project.slug}`} key={`${teamSlug}/${project.slug}`} tabs={TABS} />
      <Outlet />
    </>
  );
}
