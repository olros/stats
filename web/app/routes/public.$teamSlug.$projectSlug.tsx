import { Outlet, useLoaderData, redirect } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';
import { Container } from '~/components/container';
import { RepositoryLink } from '~/components/repository-link';
import { Typography } from '~/components/typography';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.project.team.name}/${data?.project.name} | Stats` }];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.teamSlug, 'Expected params.teamSlug');
  invariant(params.projectSlug, 'Expected params.projectSlug');

  const project = await prismaClient.project.findFirst({
    where: {
      slug: params.projectSlug,
      teamSlug: params.teamSlug,
      public_statistics: true,
    },
    select: {
      name: true,
      team: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!project) {
    throw redirect('/');
  }

  try {
    return { project };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default function PublicPageviewsStatistics() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <Container>
      <Typography variant='h1' className='py-8 text-center break-words'>{`Stats for ${project.team.name}/${project.name}`}</Typography>
      <Outlet />
      <RepositoryLink />
    </Container>
  );
}
