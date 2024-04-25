import { Container, Typography } from '@mui/joy';
import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@vercel/remix';
import { prismaClient } from '~/prismaClient';
import invariant from 'tiny-invariant';
import { redirect } from '~/utils.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `${data?.project.team.name}/${data?.project.name} | Stats` }];

export const loader = async ({ params, response }: LoaderFunctionArgs) => {
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
    throw redirect(response, '/');
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
    <Container sx={{ py: 2 }}>
      <Typography level='h1' sx={{ pb: 4, wordBreak: 'break-word' }} textAlign='center'>{`Stats for ${project.team.name}/${project.name}`}</Typography>
      <Outlet />
      <Typography component='a' href='https://github.com/olros/stats' sx={{ textAlign: 'center', my: 2 }} target='_blank'>
        @olros/stats
      </Typography>
    </Container>
  );
}
