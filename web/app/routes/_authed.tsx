import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { Container } from '~/components/container';
import { RepositoryLink } from '~/components/repository-link';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserOrRedirect(request);
  const teams = await prismaClient.team.findMany({
    where: {
      teamUsers: {
        some: {
          userId: user.id,
        },
      },
    },
    include: { projects: true },
  });
  return { teams, user };
};

export default function Index() {
  const { teams, user } = useLoaderData<typeof loader>();
  return (
    <Container>
      <Navbar teams={teams} user={user} />
      <Outlet />
      <RepositoryLink />
    </Container>
  );
}
