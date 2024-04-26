import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { json, redirect } from '@vercel/remix';
import { LinkTabs } from '~/components/LinkTabs';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';
import { Card } from '~/components/ui/card';
import { Typography } from '~/components/typography';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.project.name} | Stats` }];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');

  const teamSlug = params.teamSlug.toLowerCase();
  const projectSlug = params.projectSlug.toLowerCase();

  const project = await prismaClient.project.findFirst({ where: { slug: projectSlug, teamSlug: teamSlug } });

  if (!project) {
    throw redirect(`/dashboard/${teamSlug}`);
  }
  return json({ teamSlug, project });
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
      <Card className='flex gap-2 justify-between items-center [view-transition-name:project-card]'>
        <Typography variant='h1' className='text-ellipsis overflow-hidden [view-transition-name:project-name]'>
          {project.name}
        </Typography>
        <Typography asChild variant='small'>
          <a href={project.url} className=' underline text-ellipsis overflow-hidden [view-transition-name:project-url]' target='_blank'>
            {project.url}
          </a>
        </Typography>
      </Card>
      <LinkTabs aria-label='Select project page' baseLocation={`/dashboard/${teamSlug}/${project.slug}`} key={`${teamSlug}/${project.slug}`} tabs={TABS} />
      <Outlet />
    </>
  );
}
