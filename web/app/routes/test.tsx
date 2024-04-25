import { Avatar, Button, Card, Stack, Typography } from '@mui/joy';
import { Link } from '@remix-run/react';
import type { MetaFunction } from '@vercel/remix';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const meta: MetaFunction = () => [{ title: 'Profile | Stats' }];

export default function Test() {
  return (
    <Card>
      <Stack alignItems='center' direction='row' gap={1}>
        <Avatar alt={`Profile image`} size='lg' sx={{ viewTransitionName: 'avatar' }}>
          Navn
        </Avatar>
        <Typography level='h1'>Name</Typography>
      </Stack>
      <Typography level='body-lg'>Email: email</Typography>
      <Typography level='body-lg'>GitHub: github_username</Typography>
      <Button color='danger' component={Link} sx={{ mt: 2 }} to='/auth/logout' variant='outlined'>
        Log out
      </Button>
    </Card>
  );
}
