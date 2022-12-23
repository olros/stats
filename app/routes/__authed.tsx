import { Card, styled, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { authenticator } from '~/auth.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: 'auto 1fr',
  padding: theme.spacing(2),
  height: '100vh',
  gap: theme.spacing(2),
}));

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  return { user };
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Grid>
      <Card sx={{ gridColumn: 'span 2' }} variant='outlined'>
        <Typography level='h1' textAlign='center'>
          Authed: {user.name}
        </Typography>
      </Card>
      <Outlet />
    </Grid>
  );
}
