import { Container, Typography } from '@mui/joy';
import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@vercel/remix';
import { getUserOrRedirect } from '~/auth.server';
import { Navbar } from '~/components/Navbar';
import { prismaClient } from '~/prismaClient';
import { jsonHash } from 'remix-utils/json-hash';

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
  return jsonHash({ teams, user });
};

export default function Index() {
  const { teams, user } = useLoaderData<typeof loader>();
  return (
    <Container sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 1, minHeight: '95vh' }}>
      <Navbar teams={teams} user={user} />
      <Outlet />
      <Typography component='a' href='https://github.com/olros/stats' sx={{ textAlign: 'center', py: 2, mt: 'auto' }} target='_blank'>
        @olros/stats
      </Typography>
    </Container>
  );
}
