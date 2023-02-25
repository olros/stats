import { Button, Card, styled, Typography } from '@mui/joy';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { authenticator } from '~/auth.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

export const loader = async ({ request }: LoaderArgs) => {
  const isAuthenticated = await authenticator.isAuthenticated(request);

  return json({ isAuthenticated });
};

export default function Index() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  return (
    <Grid>
      <Card sx={{ gridColumn: 'span 2' }}>
        <Typography level='h1' textAlign='center'>
          Stats
        </Typography>
      </Card>
      <Card>
        {isAuthenticated ? (
          <>
            <Typography gutterBottom level='h2'>
              Dashboard
            </Typography>
            <Button component={Link} to='/dashboard'>
              Open dashboard
            </Button>
          </>
        ) : (
          <>
            <Typography gutterBottom level='h2'>
              Log in
            </Typography>
            <Button component={Link} to='/login'>
              Log in
            </Button>
          </>
        )}
      </Card>
    </Grid>
  );
}
